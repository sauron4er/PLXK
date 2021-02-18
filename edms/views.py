from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseForbidden, QueryDict
from django.contrib.auth.decorators import login_required
from django.db import transaction

from plxk.api.global_getters import get_deps
from docs.api.contracts_api import add_contract_from_edms
from accounts.models import UserProfile, Department

from .forms import DepartmentForm, SeatForm, UserProfileForm, EmployeeSeatForm, DocumentForm, NewPathForm, NewAnswerForm
from .api.vacations import arrange_vacations, add_vacation, deactivate_vacation
from .api.modules_post import *
from .api.approvals_handler import *
from .api.getters import *
from .api.setters import *
from .api.tables_creater import create_table
from .api.phases_handler import new_phase
from .api.edms_mail_sender import send_email_supervisor

# При True у списках відображаться документи, які знаходяться в режимі тестування.
from django.conf import settings
testing = settings.STAS_DEBUG


def post_path(doc_request):
    if 'path_to_answer' not in doc_request or doc_request['path_to_answer'] == '0':
        path_form = NewPathForm(doc_request)
        if path_form.is_valid():
            return path_form.save()
        else:
            raise ValidationError('edms/views: function post_path: path_form invalid')
    else:
        path_form = NewAnswerForm(doc_request)
        if path_form.is_valid():
            return path_form.save()
        else:
            raise ValidationError('edms/views: function post_path: path_form invalid')


# Функції модульних документів -----------------------------------------------------------------------------------------

# Функція, яка додає у бд новий документ та повертає його id
def post_document(request):
    try:
        doc_request = request.POST.copy()
        doc_request.update({'employee': request.user.userprofile.id})
        doc_request.update({'testing': testing})
        if doc_request['status'] == 'draft':
            doc_request.update({'is_draft': True})
        elif doc_request['status'] == 'template':
            doc_request.update({'is_template': True})

        doc_form = DocumentForm(doc_request)
        if doc_form.is_valid():
            new_doc = doc_form.save()
            return new_doc
        else:
            raise ValidationError('edms/views: function post_document: document_form invalid')
    except Exception as err:
        raise err


# Функція, яка перебирає список модулів і викликає необхідні функції для їх публікації
# Повертає список отримувачів документа (якщо використовуються модулі recipient або recipient_chief)
@try_except
def post_modules(doc_request, doc_files, new_path, new_doc):
    try:
        doc_modules = json.loads(doc_request['doc_modules'])
        recipients = []

        if 'dimensions' in doc_modules:
            post_text(doc_request, doc_modules['dimensions']['value'])

        if 'text' in doc_modules:
            post_text(doc_request, doc_modules['text'])

        if 'packaging_type' in doc_modules:
            packaging_type = [{
                'queue': doc_modules['packaging_type']['queue'],
                'text': doc_modules['packaging_type']['value']
            }]
            post_text(doc_request, packaging_type)

        if 'recipient_chief' in doc_modules:
            post_recipient_chief(doc_request, doc_modules['recipient_chief']['id'])
            recipients.append({'id': doc_modules['recipient_chief']['id'], 'type': 'chief'})

        # Додаємо список отримувачів на ознайомлення
        if 'acquaint_list' in doc_modules:
            post_acquaint_list(doc_request, doc_modules['acquaint_list'])
            for acquaint in doc_modules['acquaint_list']:
                recipients.append({'id': acquaint['id'], 'type': 'acquaint'})

        # Додаємо список отримувачів на підпис
        if 'sign_list' in doc_modules:
        #     post_sign_list(doc_request, doc_modules['sign_list'])
            for sign in doc_modules['sign_list']:
                if doc_request['document_type'] == 2:
                    sign_seat = Employee_Seat.objects.values_list('seat_id', flat=True).filter(id=sign['id'])[0]
                    if sign_seat not in [16, 21]:
                        recipients.append({'id': sign['id'], 'type': 'sign'})

        # Додаємо список отримувачів на візування
        if 'approval_list' in doc_modules:
            company = doc_modules['choose_company'] if 'choose_company' in doc_modules else 'ТДВ'
            post_approvals(doc_request, doc_modules['approval_list'], company)

        if 'days' in doc_modules:
            post_days(doc_request, doc_modules['days'])

        if 'gate' in doc_modules:
            post_gate(doc_request, doc_modules['gate'])

        if 'carry_out_items' in doc_modules:
            post_carry_out_items(doc_request, doc_modules['carry_out_items'])

        if 'mockup_type' in doc_modules:
            post_mockup_type(doc_request, doc_modules['mockup_type']['value'])

        if 'mockup_product_type' in doc_modules:
            post_mockup_product_type(doc_request, doc_modules['mockup_product_type']['value'])

        if 'client' in doc_modules:
            post_client(doc_request, doc_modules['client']['value'])

        if 'files' in doc_modules and doc_request['status'] in ['doc', 'change']:  # Файли чернетки і шаблону не записуємо
            post_files(doc_request, doc_files, new_path.pk)

        if 'contract_link' in doc_modules:
            post_contract(doc_request, doc_modules['contract_link']['value'])

        if 'choose_company' in doc_modules and doc_modules['choose_company'] != 'ТДВ':
            post_company(new_doc, doc_modules['choose_company'])

        return recipients
    except ValidationError as err:
        raise err


# Функція, яка додає файли у таблицю візування
def changes_add_files(files, doc_request):
    doc_request.update({'first_path': True})
    doc_path = get_object_or_404(Document_Path, pk=doc_request['document_path'])
    for index, file in enumerate(files):
        File.objects.create(
            document_path=doc_path,
            file=file,
            name=file.name,
            first_path=True,
            version=1
        )


# Функція, яка оновлює файли
def update_files(files, doc_request):
    updated_files_info = json.loads(doc_request['change__updated_files_info'])
    # Наразі функція update_files викликається виключно з оновлення документу,
    # тому first_path = 1 (щоб документ показувався в основній інформації):
    doc_request.update({'first_path': True})
    doc_path = get_object_or_404(Document_Path, pk=doc_request['document_path'])

    for index, file in enumerate(updated_files_info):
        # Видаляємо стару версію файлу
        File.objects.filter(id=file['old_id']).update(is_active=False, deactivate_path_id=doc_request['document_path'])
        # І додаємо нову
        File.objects.create(
            document_path=doc_path,
            file=files[index],
            name=files[index].name,
            first_path=True,
            version=file['version'] + 1
        )


# Функція, яка деактивує файли
def deactivate_files(doc_request):
    deleted_files = json.loads(doc_request['change__deleted_files'])
    for file in deleted_files:
        File.objects.filter(id=file['id']).update(is_active=False, deactivate_path_id=doc_request['document_path'])
# ---------------------------------------------------------------------------------------------------------------------


@login_required(login_url='login')
def edms_main(request):
    if request.method == 'GET':
        return render(request, 'edms/main.html')
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_get_doc_types(request):
    if request.method == 'GET':
        return HttpResponse(json.dumps(get_meta_doc_types()))


@login_required(login_url='login')
def edms_get_sub_emps(request, pk):
    if request.method == 'GET':
        seat = Employee_Seat.objects.values_list('seat_id', flat=True).filter(id=pk)[0]
        subs_list = get_sub_emps(seat)
        return HttpResponse(json.dumps(subs_list))


# Відділ кадрів --------------------------------------------------------------------------------------------------------
@login_required(login_url='login')
def edms_hr(request):
    if request.method == 'GET':

        deps = get_deps()

        seats = [{       # Список посад для форм на сторінці відділу кадрів
            'id': seat.pk,
            'seat': seat.seat,
            'dep': 'Не внесено' if seat.department is None else seat.department.name,
            'dep_id': 0 if seat.department is None else seat.department.id,
            'is_dep_chief': 'true' if seat.is_dep_chief else 'false',
            'chief': 'Не внесено' if seat.chief is None else seat.chief.seat,
            'chief_id': 0 if seat.chief is None else seat.chief.id,
        } for seat in Seat.objects.all().filter(is_active=True).order_by('seat')]

        emps = [{       # Список працівників для форм на сторінці відділу кадрів
            'id': emp.pk,
            'emp': emp.pip,
            'on_vacation': 'true' if emp.on_vacation else 'false',
            'acting': 0 if emp.acting is None else emp.acting.pip,
            'acting_id': 0 if emp.acting is None else emp.acting.id,
            'tab_number': '' if emp.tab_number is None else emp.tab_number,
        } for emp in UserProfile.objects.only(
            'id', 'pip', 'on_vacation', 'acting').filter(is_active=True).filter(is_pc_user=True).order_by('pip')]

        return render(request, 'edms/hr/hr.html', {
            'deps': deps,
            'seats': seats,
            'emps': emps,
        })

    elif request.method == 'POST':
        if 'new_dep' in request.POST:
            form = DepartmentForm(request.POST)
            if form.is_valid():
                new_dep = form.save()
                return HttpResponse(new_dep.pk)

        if 'new_seat' in request.POST:
            form = SeatForm(request.POST)
            if form.is_valid():
                new_seat = form.save()
                return HttpResponse(new_seat.pk)

        if 'new_emp_seat' in request.POST:
            form_employee_seat = EmployeeSeatForm(request.POST)
            if form_employee_seat.is_valid():
                new_emp_seat = form_employee_seat.save()
                return HttpResponse(new_emp_seat.pk)

    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_new_vacation(request):
    if request.method == 'POST':
        new_vacation_id = add_vacation(request)
        return HttpResponse(new_vacation_id)


@login_required(login_url='login')
def edms_deactivate_vacation(request):
    if request.method == 'POST':
        post_request = request.POST.copy()
        deactivate_vacation(post_request)
        return HttpResponse(status=200)


@login_required(login_url='login')
def edms_start_vacations_arrange(request):
    arrange_vacations()
    return HttpResponse(status=200)


@login_required(login_url='login')
def edms_get_vacations(request):
    vacations = [{
        'id': vacation.id,
        'begin': vacation.begin.strftime('%Y-%m-%d'),
        'end': vacation.end.strftime('%Y-%m-%d'),
        'employee': vacation.employee.pip,
        'acting': vacation.acting.pip,
        'started': vacation.started
    } for vacation in Vacation.objects
      .filter(is_active=True)]

    return HttpResponse(json.dumps(vacations))


@login_required(login_url='login')
def edms_hr_emp(request, pk):       # changes in employee row
    post = get_object_or_404(UserProfile, pk=pk)
    if request.method == 'POST':
        form = UserProfileForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect('hr.html')
    elif request.method == 'GET':
        emp_seats = [{  # список зв’язків посада-співробітник
            'id': empSeat.pk,
            'seat': empSeat.seat.seat,
        } for empSeat in Employee_Seat.objects.only('id', 'seat').filter(employee_id=pk).filter(is_active=True).order_by('seat')]
        return HttpResponse(emp_seats)


@login_required(login_url='login')
def edms_hr_dep(request, pk):       # changes in department row
    post = get_object_or_404(Department, pk=pk)
    if request.method == 'POST':
        form = DepartmentForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect('hr.html')


@login_required(login_url='login')
def edms_hr_seat(request, pk):       # changes in seat row
    post = get_object_or_404(Seat, pk=pk)
    if request.method == 'POST':
        form = SeatForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect('hr.html')


@login_required(login_url='login')
def edms_hr_emp_seat(request, pk):       # changes in emp_seat row
    post = get_object_or_404(Employee_Seat, pk=pk)
    if request.method == 'POST':
        form_request = request.POST.copy()
        form = EmployeeSeatForm(form_request, instance=post)

        # Обробка звільнення з посади:
        if form.data['is_active'] == 'false':
            active_docs = Mark_Demand.objects.filter(recipient_id=pk).filter(is_active=True).first()
            # Якщо у mark_demand є хоча б один документ і не визначено "спадкоємця", повертаємо помилку
            if active_docs is not None and form.data['successor_id'] == '':
                return HttpResponseForbidden('active flow')
            # В іншому разі зберігаємо форму і додаємо "спадкоємцю" (якщо такий є) посаду:
            else:
                if form.data['successor_id'] != '':
                    successor_temp = {
                        'employee': form.data['successor_id'],
                        'seat': form.data['seat'],
                        'is_active': True,
                        'is_main': form.data['new_is_main']
                    }
                    successor = QueryDict('').copy()
                    successor.update(successor_temp)
                    successor_form = EmployeeSeatForm(successor)
                    if successor_form.is_valid():
                        new_successor = successor_form.save()
                        form.data['successor'] = new_successor.pk
                        if form.is_valid():
                            form.save()
                            return HttpResponse('')
                else:
                    if form.is_valid():
                        form.save()
                        return HttpResponse('')


@login_required(login_url='login')
def edms_get_user(request, pk):
    emp = get_object_or_404(UserProfile, pk=pk)
    if request.method == 'GET':
        emp_seats = [{
            'id': empSeat.pk,
            'emp_seat': empSeat.seat.seat if empSeat.is_main is True else empSeat.seat.seat + ' (в.о.)',
            'seat_id': empSeat.seat.pk,
            'emp_id': empSeat.employee.pk,
        } for empSeat in
            Employee_Seat.objects.only('id', 'seat', 'employee').filter(employee_id=emp).filter(is_active=True)]

        vacations = [{
            'id': vacation.pk,
            'begin': vacation.begin.strftime('%Y-%m-%d'),
            'end': vacation.end.strftime('%Y-%m-%d'),
            'acting': vacation.acting.pip,
            'started': vacation.started
        } for vacation in
            Vacation.objects.filter(employee_id=emp).filter(is_active=True)]

        user = {}
        user.update({'emp_seats': emp_seats})
        user.update({'vacations': vacations})

        return HttpResponse(json.dumps(user))


@login_required(login_url='login')
def edms_get_emp_seats(request):
    if request.method == 'GET':
        emp_seats = [{
            'id': empSeat.pk,
            'seat': empSeat.seat.seat if empSeat.is_main is True else empSeat.seat.seat + ' (в.о.)',
            'emp': empSeat.employee.pip,
        } for empSeat in
            Employee_Seat.objects.only('id', 'seat', 'employee')
                .filter(employee__is_pc_user=True)
                .filter(is_active=True).order_by('employee__pip')]

        return HttpResponse(json.dumps(emp_seats))


@login_required(login_url='login')
def edms_get_contracts(request, company):
    if request.method == 'GET':
        contracts = [{
            'id': contract.pk,
            'name': (contract.number if contract.number else 'б/н') + ', "' + contract.subject + '"',
            'company': contract.company
        } for contract in Contract.objects.filter(is_active=True).filter(company=company)]

        return HttpResponse(json.dumps(contracts))


@login_required(login_url='login')
def edms_get_chiefs(request, pk):
    emp_seat = get_object_or_404(Employee_Seat, pk=pk)
    seat_id = (Employee_Seat.objects.only('seat_id').filter(id=emp_seat.pk).first()).seat_id
    if request.method == 'GET':
        chiefs_list = get_chiefs_list(seat_id)
        # Перевертаємо список шефів (якщо він є), щоб директор був перший у списку (для автоматичного вибору у select)
        if chiefs_list:
            chiefs_list.reverse()
        return HttpResponse(json.dumps(chiefs_list))


@login_required(login_url='login')
def edms_get_direct_subs(request, pk):
    if request.method == 'GET':
        emp_seat = get_object_or_404(Employee_Seat, pk=pk)
        seat_id = (Employee_Seat.objects.only('seat_id').filter(id=emp_seat.pk).first()).seat_id
        direct_subs = [{
            'id': empSeat.id,
            'name': empSeat.employee.pip,
            'seat': empSeat.seat.seat,
            'is_active': True,
        } for empSeat in Employee_Seat.objects.filter(seat__chief_id=seat_id).filter(is_active=True)]  # Знаходимо підлеглих посади
        return HttpResponse(json.dumps(direct_subs))


@login_required(login_url='login')
@try_except
def edms_get_doc(request, pk):
    doc = get_object_or_404(Document, pk=pk)
    # Всю інформацію про документ записуємо сюди

    # Якщо employee_seat нема в запиті, значить запит прийшов зі створення нового документа, доступ треба дати
    if request.user.userprofile.is_it_admin or \
            'employee_seat' not in request.POST or \
            is_access_granted(request.user, request.POST['employee_seat'], doc):
        doc_info = {
            'access_granted': True,
            'id': pk,
            'author': doc.employee_seat.employee.pip,
            'author_seat_id': doc.employee_seat_id,
            'meta_type_id': doc.document_type.meta_doc_type_id,
            'type_id': doc.document_type.id,
            'type': doc.document_type.description,
            'date': convert_to_localtime(doc.path.values_list('timestamp', flat=True).filter(mark_id__in=[1, 16, 19])[0], 'day'),
            'is_changeable': doc.document_type.is_changeable,
            'approved': doc.approved,
            'archived': not doc.is_active
        }

        if request.POST.get('employee_seat'):
            mark_demand = Mark_Demand.objects.values('id', 'mark_id', 'phase_id')\
                .filter(is_active=True).filter(document=doc).filter(recipient=request.POST['employee_seat'])

            if mark_demand:
                doc_info.update({
                    'expected_mark': mark_demand[0]['mark_id'],
                    'mark_demand_id': mark_demand[0]['id'],
                    'phase_id': mark_demand[0]['phase_id']
                })

        # Path потрібен для складання модулю approval_list, тому отримуємо його навіть якщо документ чернетка.
        path = [{
            'id': path.id,
            'time': convert_to_localtime(path.timestamp, 'time'),
            'mark_id': path.mark_id,
            'mark': 'Запит на зміни' if path.mark_id == 3 and doc.document_type.meta_doc_type_id == 5 else path.mark.mark,
            # 'mark': path.mark.mark,
            'emp_seat_id': path.employee_seat_id,
            'emp': path.employee_seat.employee.pip,
            'seat': path.employee_seat.seat.seat if path.employee_seat.is_main else '(в.о.) ' + path.employee_seat.seat.seat,
            'comment': path.comment,
            'original_path': path.path_to_answer_id,
        } for path in Document_Path.objects.filter(document_id=doc.pk).order_by('-timestamp')]

        # Шукаємо path i flow документа, якщо це не чернетка чи шаблон:
        if not doc.is_draft and not doc.is_template:
            # Перебираємо шлях документа:
            for step in path:
                # Шукаємо резолюції та "на ознайомлення" і додаємо їх до запису в path
                if step['mark_id'] == 10:
                    resolutions = [{
                        'id': md.id,
                        'emp_seat_id': md.recipient.id,
                        'emp_seat': md.recipient.employee.pip + ', ' + md.recipient.seat.seat,
                        'comment': md.comment,
                    } for md in Mark_Demand.objects.filter(document_path_id=step['id'])]
                    step['resolutions'] = resolutions
                if step['mark_id'] == 15:
                    acquaints = [{
                        'id': md.id,
                        'emp_seat_id': md.recipient.id,
                        'emp_seat': md.recipient.employee.pip + ', ' + md.recipient.seat.seat,
                    } for md in Mark_Demand.objects.filter(document_path_id=step['id'])]
                    step['acquaints'] = acquaints

                # Шукаємо додані файли і додаємо їх до відповідного запису в path
                files = [{
                    'id': file.id,
                    'file': file.file.name,
                    'name': file.name,
                    'path_id': file.document_path.id,
                    'mark_id': file.document_path.mark.id,
                    'version': file.version,
                } for file in File.objects.filter(document_path_id=step['id'])]
                step['files'] = files

                # Шукаємо видалені файли і додаємо їх до відповідного запису в path
                deactivated_files = [{
                    'id': file.id,
                    'file': file.file.name,
                    'name': file.name,
                    'path_id': file.document_path.id,
                    'mark_id': file.document_path.mark.id,
                    'version': file.version,
                } for file in File.objects.filter(deactivate_path_id=step['id'])]
                step['deactivated_files'] = deactivated_files

            doc_info.update({'path': path})

            # В кого на черзі документ:
            flow_all = [{
                'id': demand.id,
                'emp_seat_id': demand.recipient.id,
                'emp': demand.recipient.employee.pip,
                'seat': demand.recipient.seat.seat if demand.recipient.is_main else '(в.о.) ' + demand.recipient.seat.seat,
                'expected_mark': demand.mark_id,
            } for demand in Mark_Demand.objects.filter(document_id=doc.pk).filter(is_active=True)]

            # Розділяємо чергу на два потоки: "На ознайомлення" та "На черзі у"
            flow = []
            acquaints = []

            for step in flow_all:
                if step['expected_mark'] == 8:
                    acquaints.append(step)
                else:
                    flow.append(step)

            if flow:
                doc_info.update({'flow': flow})

            if acquaints:
                doc_info.update({'acquaints': acquaints})

        doc_info.update(get_doc_modules(doc))
    else:
        doc_info = {'access_granted': False}

    return HttpResponse(json.dumps(doc_info))


@transaction.atomic
@login_required(login_url='login')
@try_except
def edms_my_docs(request):
    if request.method == 'GET':

        my_seats = get_my_seats(request.user.userprofile.id)

        new_docs = get_allowed_new_doc_types(request)

        my_docs = [{  # Список документів, створених даним юзером
            'id': path.document.id,
            'type': path.document.document_type.description,
            'type_id': path.document.document_type.id,
            'date': convert_to_localtime(path.timestamp, 'day'),
            'emp_seat_id': path.employee_seat.id,
            'author': request.user.userprofile.pip,
            'author_seat_id': path.employee_seat.id,
            'main_field': get_main_field(path.document),
            'status': 'draft' if path.document.is_draft else ('template' if path.document.is_template else 'doc'),
        } for path in Document_Path.objects
            .filter(mark__in=[1, 16, 19])
            .filter(employee_seat__employee_id=request.user.userprofile.id)
            .filter(document__testing=testing)
            .filter(document__is_active=True)
            .filter(document__closed=False).order_by('-id')]

        work_docs = [{  # Список документів, що очікують на реакцію користувача
            'id': demand.document.id,
            'type': demand.document.document_type.description,
            'type_id': demand.document.document_type_id,
            'flow_id': demand.id,
            'date': convert_to_localtime(demand.document.date, 'day'),
            'emp_seat_id': demand.recipient.id,
            'expected_mark': demand.mark.id,
            'author': demand.document.employee_seat.employee.pip,
            'author_seat_id': demand.document.employee_seat_id,
            'main_field': get_main_field(demand.document),
            'mark_demand_id': demand.id,
            'phase_id': demand.phase_id,
        } for demand in Mark_Demand.objects
            .filter(recipient_id__employee_id=request.user.userprofile.id)
            .filter(document__testing=testing)
            .filter(is_active=True).filter(document__closed=False)
            .order_by('document_id')]
        return render(request, 'edms/my_docs/my_docs.html', {
            'new_docs': new_docs, 'my_docs': my_docs, 'my_seats': my_seats, 'work_docs': work_docs
        })

    elif request.method == 'POST':
        doc_request = request.POST.copy()

        doc_files = request.FILES.getlist('file')

        # Записуємо документ і отримуємо його ід, тип
        new_doc = post_document(request)
        doc_request.update({'document': new_doc.pk})
        doc_type = Document.objects.values_list('document_type', flat=True).filter(id=doc_request['document'])[0]
        doc_request.update({'document_type': doc_type})

        # Отримуємо назву типу документа та ім’я автора документа для формування листів отримувачам
        doc_request = get_additional_doc_info(doc_request)

        if doc_request['status'] in ['doc', 'change']:  # Публікація документу
            doc_request.update({'mark': 1})
        elif doc_request['status'] == 'draft':  # Збереження чернетки
            doc_request.update({'mark': 16})
        else:
            doc_request.update({'mark': 19})  # Збереження шаблону
        doc_request.update({'comment': ''})

        # Записуємо перший крок шляху документа і отримуємо його ід
        new_path = post_path(doc_request)
        doc_request.update({'document_path': new_path.pk})

        # Модульна система:
        # В деяких модулях прямо може бути вказано отримувачів,
        # тому post_modules повертає їх в array, який може бути і пустий
        module_recipients = post_modules(doc_request, doc_files, new_path, new_doc)

        if doc_request['status'] in ['doc', 'change']:
            new_phase(doc_request, 1, module_recipients)

        # Деактивуємо стару чернетку
        if doc_request['old_status'] == 'draft':
            delete_doc(doc_request, int(doc_request['old_id']))

        # Деактивуємо mark_demands документу на основі якого зробили новий
        if doc_request['status'] == 'change':
            doc_request.update({'document': doc_request['old_id']})
            post_mark_deactivate(doc_request)

        if not testing:
            supervisors = get_supervisors(doc_request['document_type'])  # Список осіб, яким треба відправити лист про створення документу
            for supervisor in supervisors:
                if supervisor['emp_id'] != request.user.userprofile.id:
                    send_email_supervisor('new', doc_request, supervisor['mail'])

        return HttpResponse(new_doc.pk)


@login_required(login_url='login')
def edms_get_doc_type_modules(request, pk):
    if request.method == 'GET':
        doc_type = get_object_or_404(Document_Type, pk=pk)
        doc_type_modules = get_doc_type_modules(doc_type)
        main_field_queue = Document_Type_Module.objects.values_list('queue', flat=True)\
            .filter(document_type=doc_type)\
            .filter(is_main_field=True)\
            .filter(is_active=True)[0]
        response = {
            'doc_type_modules': doc_type_modules,
            'main_field_queue': main_field_queue
        }
        return HttpResponse(json.dumps(response))


@login_required(login_url='login')
def edms_get_drafts(request):
    try:
        if request.method == 'GET':
            my_drafts = [{
                'id': draft.id,
                'type': draft.document_type.description,
                'type_id': draft.document_type.id,
                'date': convert_to_localtime(draft.date, 'day')
            } for draft in Document.objects\
                .filter(employee_seat__employee_id=request.user.userprofile.id)
                .filter(is_draft=True)
                .filter(testing=testing)
                .filter(closed=False)]

            response = my_drafts if len(my_drafts) > 0 else []

            return HttpResponse(json.dumps(response))
    except Exception as err:
        return HttpResponse(status=405, content=err)


@login_required(login_url='login')
def edms_get_templates(request):
    try:
        if request.method == 'GET':
            my_templates = [{
                'id': template.id,
                'type': template.document_type.description,
                'type_id': template.document_type.id,
                'date': convert_to_localtime(template.date, 'day'),
            } for template in Document.objects
                .filter(employee_seat__employee_id=request.user.userprofile.id)
                .filter(is_template=True)
                .filter(testing=testing)
                .filter(closed=False)]

            response = my_templates if len(my_templates) > 0 else []

            return HttpResponse(json.dumps(response))
    except Exception as err:
        return HttpResponse(status=405, content=err)


@login_required(login_url='login')
def edms_del_doc(request, pk):
    try:
        if request.method == 'POST':
            delete_doc(request.POST.copy(), pk)
            return HttpResponse(pk)
    except Exception as err:
        return HttpResponse(status=405, content=err)


@login_required(login_url='login')
def edms_archive(request):
    if request.method == 'GET':
        return render(request, 'edms/archive/archive.html', {'doc_types': get_meta_doc_types()})
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_get_archive(request, pk):
    if request.method == 'GET':
        return HttpResponse(json.dumps(get_archive_by_doc_meta_type(request.user.userprofile.id, pk)))
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_sub_docs(request):
    if request.method == 'GET':
        my_seats = get_my_seats(request.user.userprofile.id)

        return render(request, 'edms/sub_docs/sub_docs.html', {
            'my_seats': my_seats,
        })
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_get_sub_docs(request, emp_seat, doc_meta_type, sub_emp):
    if request.method == 'GET':
        if doc_meta_type == '0' and sub_emp != '0':
            return HttpResponse(json.dumps(get_emp_seat_docs(emp_seat, sub_emp)))
        elif doc_meta_type != '0' and sub_emp != '0':
            return HttpResponse(json.dumps(get_emp_seat_and_doc_type_docs(emp_seat, sub_emp, doc_meta_type)))
        elif doc_meta_type == '0' and sub_emp == '0':
            return HttpResponse(json.dumps(get_all_subs_docs(emp_seat)))
        elif doc_meta_type != '0' and sub_emp == '0':
            return HttpResponse(json.dumps(get_doc_type_docs(emp_seat, doc_meta_type)))
    return HttpResponse(status=405)


@transaction.atomic
@login_required(login_url='login')
@try_except
def edms_mark(request):
    try:
        if request.method == 'POST':
            # Якщо документ намагаються видалити, шукаємо, чи хтось не відреагував на нього
            # Якщо позначки від інших користувачів є - відмовляємо у видаленні
            if request.POST['mark'] == '13':
                deletable = Document_Path.objects \
                    .filter(document_id=request.POST['document']) \
                    .exclude(employee_seat_id=request.POST['employee_seat'])
                if len(deletable) > 0:
                    return HttpResponse('not deletable')

            doc_request = request.POST.copy()
            doc_request = get_additional_doc_info(doc_request)
            this_phase = get_phase_info(doc_request)
            mark_author = int(doc_request['employee_seat'])
            new_path = post_path(doc_request)
            doc_request.update({'document_path': new_path.pk})
            doc_meta_type = Document_Type.objects.values_list('meta_doc_type_id', flat=True).filter(id=doc_request['document_type'])[0]

            # Створення, оновлення документу
            # Очищаємо поле auto_approved, якщо таке є і заповнене:
            if int(doc_request['mark']) in [1, 18]:
                if is_auto_approved_phase_used(doc_request['document_type']):
                    doc_request.update({'approved': None})
                    post_auto_approve(doc_request)

            # Погоджую, Ознайомлений, Доопрацьовано, Виконано, Підписано, Віза
            if int(doc_request['mark']) in [2, 9, 11, 14, 17]:
                # Деактивуємо MarkDemand цієї позначки
                deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])

                # Якщо в документі використовується doc_approval, треба буде поставити позначку у таблицю візування:
                if is_approvals_used(doc_request['document_type']):
                    arrange_approve(doc_request, True)

                # Отримуємо список необхідних (required) позначок на даній фазі, які ще не виконані
                # Якщо таких немає, переходимо до наступної фази.
                remaining_required_md = Mark_Demand.objects.filter(document_id=doc_request['document'])\
                    .filter(phase_id=doc_request['phase_id'])\
                    .filter(phase__required=True)\
                    .filter(is_active=True)\
                    .count()

                if remaining_required_md == 0:
                    if is_auto_approved_phase_used(doc_request['document_type']):
                        completely_approved = is_doc_completely_approved(doc_request)
                        if completely_approved:
                            doc_request.update({'approved': completely_approved})
                            new_phase(doc_request, this_phase['phase'] + 1, [])
                    else:
                        new_phase(doc_request, this_phase['phase'] + 1, [])

                if doc_request['mark'] == '11':  # Виконано
                    # Перетворюємо фазу документу на "Виконано"
                    set_stage(doc_request['document'], 'done')
                    if not testing:
                        supervisors = get_supervisors(
                            doc_request['document_type'])  # Список осіб, яким треба відправити лист про створення документу
                        for supervisor in supervisors:
                            send_email_supervisor('Виконано', doc_request, supervisor)

            # Відмовлено
            elif doc_request['mark'] == '3':
                # Деактивуємо лише дану mark demand, якщо це погодження Договорів чи мішків
                # (для того, щоб інші погоджуючі теж могли прокоментувати). В іншому разі деактивуємо всі.
                if doc_meta_type in [5, 6]:
                    deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])
                else:
                    deactivate_doc_mark_demands(doc_request, int(doc_request['document']))

                if is_approvals_used(doc_request['document_type']):
                    arrange_approve(doc_request, False)

                if is_auto_approved_phase_used(doc_request['document_type']):
                    doc_request.update({'approved': False})

                    next_phases_marks = Doc_Type_Phase.objects.values_list('mark_id', flat=True) \
                        .filter(document_type_id=doc_request['document_type']).filter(phase=this_phase['phase'] + 1)

                    # Якщо наступна фаза = 20, відправляємо на наступну фазу, якщо ні, то просто ставимо позначку у документ
                    # if next_phases_marks and 20 in next_phases_marks:
                    #     new_phase(doc_request, this_phase['phase'] + 1, [])
                    # else:
                    post_auto_approve(doc_request)
                    zero_phase_id = get_zero_phase_id(doc_request['document_type'])
                    post_mark_demand(doc_request, doc_request['doc_author_id'], zero_phase_id, 9)
                elif doc_meta_type in [5, 6]:
                    # відправляємо документ автору на позначку Доопрацьовано
                    zero_phase_id = get_zero_phase_id(doc_request['document_type'])
                    post_mark_demand(doc_request, doc_request['doc_author_id'], zero_phase_id, 9)

                # Перетворюємо фазу документу на "Відмовлено"
                set_stage(doc_request['document'], 'denied')
                if not testing:
                    supervisors = get_supervisors(
                        doc_request['document_type'])  # Список осіб, яким треба відправити лист про створення документу
                    for supervisor in supervisors:
                        send_email_supervisor('Відмовлено', doc_request, supervisor)

                # TODO Опрацювати позначку "Доопрацьовано" у браузері

            # На доопрацювання
            elif doc_request['mark'] == '5':
                # Деактивуємо MarkDemand цієї позначки
                deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])

                # Повертаємо виконавцю в роботу
                executant_id = Mark_Demand.objects.values_list('document_path__employee_seat_id', flat=True).filter(id=doc_request['mark_demand_id'])[0]
                post_mark_demand(doc_request, executant_id, int(get_phase_id(doc_request))-1, 11)

                # Перетворюємо фазу документу на "Взято у роботу"
                set_stage(doc_request['document'], 'in work')
                if not testing:
                    supervisors = get_supervisors(
                        doc_request['document_type'])  # Список осіб, яким треба відправити лист про створення документу
                    for supervisor in supervisors:
                        send_email_supervisor('На доопрацювання', doc_request, supervisor)

            # Не заперечую
            elif doc_request['mark'] == '6':
                # Деактивуємо MarkDemand цієї позначки
                deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])

                # Якщо в документі використовується модуль doc_approval, треба буде поставити позначку у таблицю візування:
                if is_approvals_used(doc_request['document_type']):
                    approve_id = Doc_Approval.objects.values_list('id', flat=True)\
                        .filter(document_id=doc_request['document'])\
                        .filter(emp_seat_id=doc_request['employee_seat'])[0]
                    post_approve(doc_request, approve_id, True)

                # Якщо у даній фазі вимагається позначка 2, значить треба передати документ далі по ланці керівників
                if this_phase['mark_id'] == 2:
                    doc_recipient = Doc_Recipient.objects.values_list('recipient_id', flat=True) \
                        .filter(document_id=doc_request['document']) \
                        .filter(is_active=True)
                    new_phase(doc_request, this_phase['phase'], [{'id': doc_recipient[0], 'type': 'chief'}])
                else:
                    # Якщо всі необхідні позначки проставлені, відправляємо документ у наступну фазу
                    remaining_required_md = Mark_Demand.objects\
                        .filter(document_id=doc_request['document']) \
                        .filter(phase_id=doc_request['phase_id']) \
                        .filter(phase__required=True) \
                        .filter(is_active=True) \
                        .exclude(mark_id=8) \
                        .count()
                    # .exclude(mark_id=8) - не враховуємо активні запити на ознайомлення

                    if remaining_required_md == 0:
                        new_phase(doc_request, this_phase['phase'] + 1, [])

            # Закрито
            elif doc_request['mark'] == '7':
                post_mark_deactivate(doc_request)

            # Ознайомлений
            elif doc_request['mark'] == '8':
                deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])

            # Доопрацьовано
            elif doc_request['mark'] == '9':
                test = 1

            # Резолюція
            elif doc_request['mark'] == '10':
                # Деактивуємо MarkDemand цієї позначки
                deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])
                # Створюємо MarkDemand для кожної резолюції з незмінною фазою:
                resolutions = json.loads(doc_request['resolutions'])
                for resolution in resolutions:
                    recipient = vacation_check(resolution['recipient_id'])
                    doc_request.update({'comment': resolution['comment']})
                    post_mark_demand(doc_request, recipient, get_phase_id(doc_request), 11)
                    new_mail('new', [{'id': recipient}], doc_request)

            # Видалено
            elif doc_request['mark'] == '13':
                deletable = Document_Path.objects \
                    .filter(document_id=doc_request['document']) \
                    .exclude(employee_seat_id=doc_request['employee_seat'])
                if len(deletable) > 0:
                    return HttpResponse('not deletable')
                else:
                    post_mark_delete(doc_request)

            # На ознайомлення
            elif doc_request['mark'] == '15':
                acquaints = json.loads(doc_request['acquaints'])
                # Створюємо MarkDemand для кожного користувача зі списку, більше нічого не змінюємо.

                for acquaint in acquaints:
                    acquaint = vacation_check(acquaint['emp_seat_id'])
                    post_mark_demand(doc_request, acquaint, get_phase_id(doc_request), 8)
                    new_mail('new', [{'id': acquaint}], doc_request)

            # Оновлення документу
            elif doc_request['mark'] == '18':
                # Деактивуємо всі MarkDemands даної фази
                deactivate_doc_mark_demands(doc_request, int(doc_request['document']))

                # Якщо в документі використовується doc_approval, треба скасувати всі візування:
                if is_approval_module_used(doc_request['document_type']):
                    doc_approvals = Doc_Approval.objects.values('id', 'approved', 'emp_seat_id')\
                        .filter(document_id=doc_request['document'])\
                        .filter(is_active=True)
                    for approval in doc_approvals:
                        # Анулюємо тільки підписані візування
                        if approval['approved'] is not None:
                            if doc_request['employee_seat'] == doc_request['doc_author_id']:
                                # Якщо автор оновлення = автор документа, йому відразу ставимо позначку "Погоджено"
                                post_approve(doc_request, approval['id'], True)
                            else:
                                post_approve(doc_request, approval['id'], None)

                if mark_author == doc_request['doc_author_id']:
                    # Якщо автор оновлення = автор документа, ставимо йому галочку і відправляємо на першу фазу
                    approval_id = Doc_Approval.objects.values_list('id', flat=True) \
                        .filter(document_id=doc_request['document']) \
                        .filter(approve_queue=0) \
                        .filter(is_active=True)[0]
                    post_approve(doc_request, approval_id, True)
                    new_phase(doc_request, 1, [])
                else:
                    # Якщо ні, то створюємо автору документа mark_demand з позначкою "Не заперечую" (6)
                    # і відправляємо на нульову фазу:
                    zero_phase_id = get_zero_phase_id(doc_request['document_type'])
                    post_mark_demand(doc_request, doc_request['doc_author_id'], zero_phase_id, 6)

                # Опрацьовуємо оновлені файли AAA
                if 'change__new_files' in request.FILES:
                    changes_add_files(request.FILES.getlist('change__new_files'), doc_request)

                if 'change__deleted_files' in request.POST:
                    deactivate_files(doc_request)

                if 'change__updated_files' in request.FILES:
                    update_files(request.FILES.getlist('change__updated_files'), doc_request)

            # Відповідь на коментар (відправляємо документ у MarkDemand автору оригінального коментарю)
            elif doc_request['mark'] == '21':
                original_path_mark = Document_Path.objects.values_list('mark', flat=True).filter(id=doc_request['path_to_answer'])[0]
                if is_approvals_used(doc_request['document_type']) and original_path_mark == 3:
                    # Деактивуємо запит на оновлення документу, повертаємо візуючому на візу
                    mark_demand_id = Mark_Demand.objects.values_list('id', flat=True).filter(document_path_id=doc_request['path_to_answer'])[0]
                    deactivate_mark_demand(doc_request, mark_demand_id)
                    if not is_mark_demand_exists(doc_request['path_to_answer_author'], doc_request['document']):
                        if doc_request['path_to_answer_author'] in ['813', '935']:  # Генеральні директори Лебедєв і Лишак
                            post_mark_demand(doc_request, doc_request['path_to_answer_author'], get_phase_id(doc_request), 2)
                        else:
                            post_mark_demand(doc_request, doc_request['path_to_answer_author'], get_phase_id(doc_request), 17)
                elif not is_mark_demand_exists(doc_request['path_to_answer_author'], doc_request['document'])\
                        and int(doc_request['path_to_answer_author']) != doc_request['doc_author_id']:
                    post_mark_demand(doc_request, doc_request['path_to_answer_author'], get_phase_id(doc_request), 8)
                new_mail('answer', [{'id': doc_request['path_to_answer_author']}], doc_request)

            # Додано скан-копії підписаних документів
            elif doc_request['mark'] == '22':
                # Деактивуємо MarkDemand цієї позначки
                deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])

                add_contract_from_edms(doc_request, request.FILES, request.user)

            # Взято у роботу
            elif doc_request['mark'] == '23':
                # Перетворюємо фазу документу на "Взято у роботу"
                set_stage(doc_request['document'], 'in work')

                # Деактивуємо MarkDemand інших виконавців
                executants_mark_demands = Mark_Demand.objects.values_list('id', flat=True)\
                    .filter(document=doc_request['document'])\
                    .filter(mark_id=11)\
                    .exclude(recipient_id=doc_request['employee_seat'])\
                    .filter(is_active=True)
                for md in executants_mark_demands:
                    deactivate_mark_demand(doc_request, md)

                if not testing:
                    supervisors = get_supervisors(
                        doc_request['document_type'])  # Список осіб, яким треба відправити лист про створення документу
                    for supervisor in supervisors:
                        send_email_supervisor('Взято у роботу', doc_request, supervisor)

            # Підтвердження виконання
            elif doc_request['mark'] == '24':
                # Перетворюємо фазу документу на "Підтверджено"
                set_stage(doc_request['document'], 'confirm')
                # Деактивуємо MarkDemand цієї позначки
                deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])

            if 'new_files' in request.FILES:
                post_files(doc_request, request.FILES.getlist('new_files'), new_path.pk)

            # Надсилаємо листа автору документа:
            if int(doc_request['employee_seat']) != doc_request['doc_author_id']:
                new_mail('mark', [{'id': doc_request['doc_author_id']}], doc_request)

            return HttpResponse(new_path.pk)
    except ValidationError as err:
        raise err
    except Exception as err:
        raise err


@login_required(login_url='login')
def edms_get_deps(request):
    if request.method == 'GET':
        return HttpResponse(json.dumps(get_deps()))
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_get_seats(request):
    if request.method == 'GET':
        return HttpResponse(json.dumps(get_seats()))
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_bag_design(request):
    if request.method == 'GET':
        return HttpResponse(json.dumps(get_seats()))
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_tables(request):
    if request.method == 'GET':

        doc_types_query = Document_Type.objects.filter(meta_doc_type__table_view=True)

        # Якщо параметр testing = False - програма показує лише ті типи документів, які не тестуються.
        if not testing:
            doc_types_query = doc_types_query.filter(testing=False)

        doc_types = [{
            'id': doc_type.id,
            'name': doc_type.description,
        } for doc_type in doc_types_query]

        return render(request, 'edms/tables/tables.html', {'doc_types': doc_types})
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_get_table(request, pk):
    if request.method == 'GET':
        table = create_table(pk)

        return HttpResponse(json.dumps(table))
    return HttpResponse(status=405)

