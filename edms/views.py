from django.http import HttpResponse, HttpResponseForbidden, QueryDict
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.db import transaction

from plxk.api.global_getters import get_deps
from plxk.api.convert_to_local_time import convert_to_localtime
from accounts.models import UserProfile, Department
from docs.api.contracts_api import add_contract_from_edms, get_additional_contract_reg_number, get_main_contracts, \
    check_lawyers_received
from docs.api.orders_save_from_edms_api import post_order_from_edms
from docs.models import Article_responsible, Contract_File
from production.api.getters import get_cost_rates_product_list, get_cost_rates_fields_list

from .models import Seat, Vacation, User_Doc_Type_View, Doc_Recipient, Document_Type, Document_Meta_Type, Document_Type_Version
from .forms import DepartmentForm, SeatForm, UserProfileForm, EmployeeSeatForm, NewPathForm, NewAnswerForm
from .api.vacations import arrange_vacations, add_vacation, deactivate_vacation
from .api.tables.tables_creater import create_table_first, create_table_all
from .api.modules_post import *
from .api.approvals_handler import *
from .api.getters import get_meta_doc_types, get_sub_emps, get_chiefs_list, is_access_granted, get_main_field, \
    get_doc_path, get_path_steps, get_doc_flow, get_doc_modules, get_my_seats, get_allowed_new_doc_types, \
    get_additional_doc_info, get_supervisors, get_doc_type_modules, get_auto_recipients, \
    get_emp_seat_docs, get_emp_seat_and_doc_type_docs, get_all_subs_docs, get_doc_type_docs, \
    get_phase_info, get_phase_id, is_already_approved, is_mark_demand_exists, get_seats, get_dep_seats_list, \
    get_delegated_docs, is_reg_number_free, get_approvals_for_contract_subject, get_client_requirements_list
from .api.setters import delete_doc, post_mark_deactivate, deactivate_mark_demand, deactivate_doc_mark_demands, \
    set_stage, post_mark_delete, save_foyer_ranges, set_doc_text_module, post_new_doc_approvals, handle_doc_type_version
from .api.phases_handler import new_phase
from .api.edms_mail_sender import send_email_supervisor, send_email_lebedev
from .api.tables.free_time_table import get_free_times_table
from .api.tables.it_tickets_table import get_it_tickets_table
from .api.move_to_new_employee import move_docs, move_orders, move_approvals
from .api.archives import get_archive_docs, get_work_archive_docs

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
def post_document(request, doc_modules):
    doc_request = request.POST.copy()

    new_doc = Document(document_type_id=doc_request['document_type'],
                       employee_seat_id=doc_request['employee_seat'],
                       testing=testing)

    if doc_request['status'] == 'draft':
        new_doc.is_draft = True
    elif doc_request['status'] == 'template':
        new_doc.is_template = True
    new_doc = handle_doc_type_version(new_doc, doc_request, doc_modules)

    new_doc.save()
    return new_doc


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

        if 'days' in doc_modules:
            post_days(doc_request, doc_modules['days'])

        if 'foyer_ranges' in doc_modules:
            post_foyer_ranges(doc_request, doc_modules['foyer_ranges'])

        if 'gate' in doc_modules:
            post_gate(doc_request, doc_modules['gate'])

        if 'carry_out_items' in doc_modules:
            post_carry_out_items(doc_request, doc_modules['carry_out_items'])

        if 'mockup_type' in doc_modules:
            post_mockup_type(doc_request, doc_modules['mockup_type']['value'])

        if 'mockup_product_type' in doc_modules:
            post_mockup_product_type(doc_request, doc_modules['mockup_product_type']['value'])

        if 'client' in doc_modules:
            post_counterparty(doc_request, doc_modules['client']['value'])

        if 'counterparty' in doc_modules:
            post_counterparty(doc_request, doc_modules['counterparty'])

        if 'files' in doc_modules and doc_request['status'] in ['doc', 'change']:  # Файли чернетки і шаблону не записуємо
            post_files(doc_request, doc_files, new_path.pk)

        if 'contract_link' in doc_modules:
            post_contract(doc_request, doc_modules['contract_link']['value'])

        if 'choose_company' in doc_modules and doc_modules['choose_company'] != 'ТДВ':
            post_company(new_doc, doc_modules['choose_company'])

        if 'sub_product_type' in doc_modules:
            post_sub_product_type(new_doc, doc_modules['sub_product_type'])

        if 'scope' in doc_modules:
            post_scope(new_doc, doc_modules['scope'])

        if 'law' in doc_modules:
            post_law(new_doc, doc_modules['law'])

        if 'client_requirements' in doc_modules:
            post_client_requirements(new_doc, doc_modules['client_requirements'])

        if 'document_link' in doc_modules:
            post_document_link(new_doc, doc_modules['document_link'], 39)
            
        if 'registration' in doc_modules:
            post_registration(new_doc, doc_modules['registration'])

        if 'employee' in doc_modules:
            post_employee(new_doc, doc_modules['employee'])

        if 'cost_rates' in doc_modules:
            post_cost_rates(new_doc, doc_modules['cost_rates'])

        if 'contract_subject' in doc_modules:
            post_contract_subject(new_doc, doc_modules['contract_subject'])

        if 'deadline' in doc_modules:
            post_deadline(new_doc, doc_modules['deadline'])
        
        if 'employee_seat' in doc_modules:
            post_employee_seat(new_doc, doc_modules['employee_seat'])

        if 'decree_articles' in doc_modules:
            post_decree_articles(new_doc, doc_modules['decree_articles'])

        if 'client_requirements_choose' in doc_modules:
            post_document_link(new_doc, doc_modules['client_requirements_choose'], 47)

        # Записуємо main_field
        main_field = get_main_field(new_doc)
        new_doc.main_field = main_field[0:49]
        new_doc.save()

        # Наступні три модулі треба опрацьовувати в кінці, щоб надсилання листів відбувалося з записаними main_field
        # Додаємо список отримувачів на ознайомлення
        if 'acquaint_list' in doc_modules:
            post_acquaint_list(doc_request, doc_modules['acquaint_list'])
            for acquaint in doc_modules['acquaint_list']:
                recipients.append({'id': acquaint['id'], 'type': 'acquaint'})

        # Додаємо список отримувачів на підпис
        if 'sign_list' in doc_modules:
            for sign in doc_modules['sign_list']:
                sign_seat = Employee_Seat.objects.values_list('seat_id', flat=True).filter(id=sign['id'])[0]
                if not (doc_request['document_type'] == 2 and sign_seat in [16, 21]):
                    recipients.append({'id': sign['id'], 'type': 'sign'})

        # Додаємо список отримувачів на візування
        if 'approval_list' in doc_modules:
            company = doc_modules['choose_company'] if 'choose_company' in doc_modules else 'ТДВ'
            contract_subject_approvals = get_approvals_for_contract_subject(doc_modules)
            post_approvals(doc_request, doc_modules['approval_list'], company, contract_subject_approvals)

        return recipients, new_doc
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
def get_cost_rates_products(request):
    if request.method == 'GET':
        return HttpResponse(json.dumps(get_cost_rates_product_list()))


@login_required(login_url='login')
def get_cost_rates_fields(request, product_id):
    return HttpResponse(json.dumps(get_cost_rates_fields_list(product_id)))


@login_required(login_url='login')
def edms_get_sub_emps(request, pk):
    if request.method == 'GET':
        seat = Employee_Seat.objects.values_list('seat_id', flat=True).filter(id=pk)[0]
        subs_list = get_sub_emps(seat, True)
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
@transaction.atomic
def edms_hr_emp_seat(request, pk):       # changes in emp_seat row
    post = get_object_or_404(Employee_Seat, pk=pk)
    if request.method == 'POST':
        form_request = request.POST.copy()
        form = EmployeeSeatForm(form_request, instance=post)

        # Обробка звільнення з посади:
        if form.data['is_active'] == 'false':
            # Якщо у mark_demand є хоча б один документ і не визначено "спадкоємця", повертаємо помилку
            active_docs = Mark_Demand.objects.filter(recipient_id=pk).filter(is_active=True).first()
            if active_docs is not None and form.data['successor_id'] == '' and form.data['successor_old_emp'] == '0':
                return HttpResponseForbidden('active flow')

            # Якщо у mark_demand є хоча б один документ і не визначено "спадкоємця", повертаємо помилку
            active_orders = Article_responsible.objects.filter(employee_seat_id=pk).filter(done=False).filter(is_active=True).first()
            if active_orders is not None and form.data['successor_id'] == '' and form.data['successor_old_emp'] == '0':
                return HttpResponseForbidden('active orders')

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
                            move_docs(pk, new_successor.pk)
                            move_approvals(pk, new_successor.pk)
                            move_orders(pk, new_successor.pk)

                            #TODO Відправляти листа про отримання наказів і документів від попередника
                            # -- Перегляньте накази на стоірнці Накази в розділі "Мій календар",
                            # -- Перегляньте документи на сторінці "Документи"

                            return HttpResponse('')
                elif form.data['successor_old_emp'] != '':
                    form.data['successor'] = form.data['successor_old_emp']
                    if form.is_valid():
                        form.save()
                        move_docs(pk, form.data['successor_old_emp'])
                        move_approvals(pk, form.data['successor_old_emp'])
                        move_orders(pk, form.data['successor_old_emp'])
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
def edms_get_emp_seats(request, doc_meta_type_id=0):
    # doc_meta_type_id додано для випадку, якщо запрос робиться зі сторінки тіпа .../edms/tables/7/
    if request.method == 'GET':
        emp_seats = [{
            'id': empSeat.pk,
            'seat': empSeat.seat.seat if empSeat.is_main is True else empSeat.seat.seat + ' (в.о.)',
            'emp': empSeat.employee.pip,
            'name': empSeat.employee.pip + ', ' + (empSeat.seat.seat if empSeat.is_main is True else empSeat.seat.seat + ' (в.о.)'),
            'is_dep_chief': 'true' if empSeat.seat.is_dep_chief else '',
            'on_vacation': 'true' if empSeat.employee.on_vacation else ''
        } for empSeat in
            Employee_Seat.objects.only('id', 'seat', 'employee')
                .filter(employee__is_pc_user=True)
                .exclude(employee__delete_from_noms=True)
                .filter(is_active=True).order_by('employee__pip')]

        return HttpResponse(json.dumps(emp_seats))


@login_required(login_url='login')
def edms_get_contracts(request, company, counterparty_id):
    if request.method == 'GET':
        return HttpResponse(json.dumps(get_main_contracts(company, counterparty_id)))


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
    # request.user.id in [52, 66] - Лебедєв, Мальцев
    if request.user.userprofile.is_it_admin or \
            request.user.id in [52, 66] or \
            'employee_seat' not in request.POST or \
            is_access_granted(request.user, request.POST['employee_seat'], doc):
        doc_info = {
            'access_granted': True,
            'id': pk,
            'responsible': doc.employee_seat.employee.pip,
            'responsible_seat_id': doc.employee_seat_id,
            'viewer_is_author': doc.employee_seat.employee.id == request.user.userprofile.id,
            'viewer_is_admin': request.user.userprofile.is_it_admin,
            'meta_type_id': doc.document_type.meta_doc_type_id,
            'type_id': doc.document_type.id,
            'type': doc.document_type.description,
            'date': convert_to_localtime(doc.path.values_list('timestamp', flat=True).filter(mark_id__in=[1, 16, 19])[0], 'day'),
            'is_changeable': doc.document_type.is_changeable,
            'is_deactivatable': doc.document_type.is_deactivatable,
            'approved': doc.approved,
            'archived': not doc.is_active,
            'closed': doc.closed,
            'main_field': doc.main_field,
            'doc_type_version': doc.doc_type_version.version_id if doc.doc_type_version else 0,
            'doc_type_version_name': doc.doc_type_version.description if doc.doc_type_version else '',
            'stage': doc.stage,
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
        path = get_doc_path(doc.document_type.meta_doc_type_id, doc.pk)

        # Шукаємо path i flow документа, якщо це не чернетка чи шаблон:
        if not doc.is_draft and not doc.is_template:
            doc_info.update({'path': get_path_steps(path)})

            flow_and_acquaints = get_doc_flow(doc.pk)
            if flow_and_acquaints['flow']:
                doc_info.update({'flow': flow_and_acquaints['flow']})

            if flow_and_acquaints['acquaints']:
                doc_info.update({'acquaints': flow_and_acquaints['acquaints']})

        # Модулі
        employee_seat_id = request.POST['employee_seat'] if 'employee_seat' in request.POST else 0
        doc_info.update(get_doc_modules(doc, employee_seat_id))

        is_super_manager = User_Doc_Type_View.objects.values_list('super_manager', flat=True)\
            .filter(employee=request.user.userprofile)\
            .filter(meta_doc_type=doc.document_type.meta_doc_type)\
            .filter(is_active=True)

        doc_info.update({'user_is_super_manager': True in list(is_super_manager)})

        # Якщо це Договір, то перевіряємо, чи прикріплено скани підписаного договору і підтягуємо їх:
        if doc.document_type.meta_doc_type_id == 5 and doc.approved:
            try:
                signed_files = [{
                    'id': file.id,
                    'name': file.name,
                    'file': file.file.name,
                    'status': 'old'
                } for file in Contract_File.objects
                    .filter(is_active=True)
                    .filter(contract__is_active=True)
                    .filter(contract__edms_doc_id=doc.id)]

                doc_info.update({'signed_files': signed_files})
            except Http404:
                pass
                # doc_info.update({'signed_files': []})

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

        # my_docs = [{  # Список документів, за якими користувач є відповідальний (створив його або отримав у спадок)
        #     'id': path.document.id,
        #     'type': path.document.document_type.description,
        #     'type_id': path.document.document_type.id,
        #     'date': convert_to_localtime(path.timestamp, 'day'),
        #     'emp_seat_id': path.employee_seat.id,
        #     'author': request.user.userprofile.pip,
        #     'author_seat_id': path.employee_seat.id,
        #     'main_field': get_main_field(path.document),
        #     'status': 'draft' if path.document.is_draft else ('template' if path.document.is_template else 'doc'),
        # } for path in Document_Path.objects
        #     .filter(mark__in=[1, 16, 19])
        #     .filter(employee_seat__employee_id=request.user.userprofile.id)
        #     .filter(document__testing=testing)
        #     .filter(document__is_active=True)
        #     .filter(document__closed=False).order_by('-id')]

        my_docs = [{  # Список документів, за якими користувач є відповідальний (створив його або отримав у спадок)
            'id': doc.id,
            'type': doc.document_type.description,
            'type_id': doc.document_type.id,
            'date': convert_to_localtime(doc.date, 'day'),
            'responsible': request.user.userprofile.pip,
            'responsible_seat_id': doc.employee_seat.id,
            'main_field': doc.main_field,
            'status': 'draft' if doc.is_draft else ('template' if doc.is_template else 'doc'),
        } for doc in Document.objects
            .filter(employee_seat__employee_id=request.user.userprofile.id)
            .filter(testing=testing)
            .filter(is_active=True)
            .filter(closed=False).order_by('-id')]

        work_docs = [{  # Список документів, що очікують на реакцію користувача
            'id': demand.document.id,
            'type': demand.document.document_type.description,
            'type_id': demand.document.document_type_id,
            'flow_id': demand.id,
            'date': convert_to_localtime(demand.document.date, 'day'),
            'emp_seat_id': demand.recipient.id,
            'expected_mark': demand.mark.id,
            'responsible': demand.document.employee_seat.employee.pip,
            'responsible_seat_id': demand.document.employee_seat_id,
            'main_field': demand.document.main_field,
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
        doc_modules = json.loads(request.POST['doc_modules'])
        if 'registration' in doc_modules and not is_reg_number_free(doc_modules['registration']):
            return HttpResponse('reg_number_taken')

        doc_request = request.POST.copy()

        doc_files = request.FILES.getlist('file')

        # Записуємо документ і отримуємо його ід, тип
        new_doc = post_document(request, doc_modules)
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
        # також post_modules зберігає main_field в документі і повертає оновлений документ
        module_recipients, new_doc = post_modules(doc_request, doc_files, new_path, new_doc)

        # Запускаємо в роботу
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

            # Відправляємо листа Лебедєву
            if request.POST['document_type'] in ['20', '14', '3']:
                send_email_lebedev(doc_request, new_doc.main_field)

        return HttpResponse(new_doc.pk)


@login_required(login_url='login')
def edms_get_doc_type_modules(request, meta_type_id, type_id):
    if request.method == 'GET':
        if meta_type_id != '0':
            doc_type = get_object_or_404(Document_Type, meta_doc_type_id=meta_type_id, is_active=True)
        else:
            doc_type = get_object_or_404(Document_Type, pk=type_id)

        doc_type_modules = get_doc_type_modules(doc_type)

        # Поле, яке показується у списку документів
        main_field_queue = Document_Type_Module.objects.values_list('queue', flat=True)\
            .filter(document_type=doc_type)\
            .filter(is_main_field=True)\
            .filter(is_active=True)[0]

        # Список отримувачів, який показано внизу документа
        auto_recipients = get_auto_recipients(type_id)

        response = {
            'doc_type_modules': doc_type_modules,
            'main_field_queue': main_field_queue,
            'auto_recipients': auto_recipients,
            'doc_type_id': doc_type.pk
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
def edms_del_doc(request, pk, deact):
    try:
        delete_doc(request.POST.copy(), pk, deact == 1)
        return HttpResponse(pk)
    except Exception as err:
        return HttpResponse(status=405, content=err)


@login_required(login_url='login')
def edms_archive(request):
    if request.method == 'GET':
        return render(request, 'edms/archive/archive.html', {'doc_types': get_meta_doc_types()})
    return HttpResponse(status=405)


@login_required(login_url='login')
def get_archive(request, archive_type, meta_doc_id, page):
    archive = get_archive_docs(request, archive_type, meta_doc_id, page)
    return HttpResponse(json.dumps(archive))


@login_required(login_url='login')
def get_work_archive(request, archive_type, meta_doc_id, page):
    archive = get_work_archive_docs(request, archive_type, meta_doc_id, page)
    return HttpResponse(json.dumps(archive))


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
                # Деактивуємо MarkDemand цієї позначки, якщо це не позначка від супер-менеджера
                if doc_request['user_is_super_manager'] != 'true':
                    deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])
                else:
                    # Якщо це позначка від супер-менеджера, деактивуємо всі Mark_demand
                    deactivate_doc_mark_demands(doc_request, int(doc_request['document']))

                # Якщо в документі використовується doc_approval, треба буде поставити позначку у таблицю візування:
                if is_approvals_used(doc_request['document_type']):
                    arrange_approve(doc_request, True)

                if doc_request['mark'] == '11':  # Виконано
                    # Перетворюємо фазу документу на "Виконано"
                    set_stage(doc_request['document'], 'done')

                    # Деактивуємо MarkDemand інших виконавців (в заявках)
                    executants_mark_demands = Mark_Demand.objects.values_list('id', flat=True) \
                        .filter(document=doc_request['document']) \
                        .filter(mark_id=11) \
                        .exclude(recipient_id=doc_request['employee_seat']) \
                        .filter(is_active=True)
                    for md in executants_mark_demands:
                        deactivate_mark_demand(doc_request, md)

                # Отримуємо список необхідних (required) позначок на даній фазі, які ще не виконані
                # Якщо таких немає, переходимо до наступної фази.
                remaining_required_md = Mark_Demand.objects.filter(document_id=doc_request['document']) \
                    .filter(phase_id=doc_request['phase_id']) \
                    .filter(phase__required=True) \
                    .exclude(mark=8) \
                    .filter(is_active=True) \
                    .count()

                if remaining_required_md == 0:
                    if is_auto_approved_phase_used(doc_request['document_type']):
                        completely_approved = is_doc_completely_approved(doc_request)
                        if completely_approved:
                            doc_request.update({'approved': completely_approved})
                        new_phase(doc_request, this_phase['phase'] + 1, [])
                    else:
                        new_phase(doc_request, this_phase['phase'] + 1, [])

                if not testing:
                    supervisors = get_supervisors(
                        doc_request['document_type'])  # Список осіб, яким треба відправити лист про створення документу
                    for supervisor in supervisors:
                        send_email_supervisor('Виконано', doc_request, supervisor['mail'])

            # Відмовлено
            elif doc_request['mark'] == '3':
                # Деактивуємо лише дану mark demand, якщо це погодження Договорів, мішків чи тендерів
                # (для того, щоб інші погоджуючі теж могли прокоментувати). В іншому разі деактивуємо всі.
                # TODO може переробити з перевірки на мета_тип на перевірку "is_approval_used"
                if doc_meta_type in [5, 6, 9]:
                    deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])
                else:
                    deactivate_doc_mark_demands(doc_request, int(doc_request['document']))

                if is_approvals_used(doc_request['document_type']):
                    arrange_approve(doc_request, False)

                if is_auto_approved_phase_used(doc_request['document_type']):
                    doc_request.update({'approved': False})

                    # next_phases_marks = Doc_Type_Phase.objects.values_list('mark_id', flat=True) \
                    #     .filter(document_type_id=doc_request['document_type']).filter(phase=this_phase['phase'] + 1)

                    # Якщо наступна фаза = 20, відправляємо на наступну фазу, якщо ні, то просто ставимо позначку у документ
                    # if next_phases_marks and 20 in next_phases_marks:
                    #     new_phase(doc_request, this_phase['phase'] + 1, [])
                    # else:
                    post_auto_approve(doc_request)
                    # zero_phase_id = get_zero_phase_id(doc_request['document_type'])
                    post_mark_demand(doc_request, doc_request['doc_author_id'], this_phase['id'], 9)
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
                        send_email_supervisor('Відмовлено', doc_request, supervisor['mail'])

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
                        send_email_supervisor('На доопрацювання', doc_request, supervisor['mail'])

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

                # Позначаємо документ непогодженим
                doc_instance = get_object_or_404(Document, id=doc_request['document'])
                doc_instance.approved = None
                doc_instance.save()

                # Якщо в документі використовується doc_approval, треба скасувати всі візування:
                if is_approval_module_used(doc_request['document_type']):
                    doc_approvals = Doc_Approval.objects.values('id', 'approved', 'emp_seat_id')\
                        .filter(document_id=doc_request['document'])\
                        .filter(is_active=True)
                    for approval in doc_approvals:
                        # Анулюємо тільки підписані візування
                        if approval['approved'] is not None:
                            if doc_request['employee_seat'] == doc_request['doc_author_id']:
                                post_approve(doc_request, approval['id'], True)
                            else:
                                post_approve(doc_request, approval['id'], None)

                    # Автору оновлення ставимо галочку у таблицю
                    arrange_approve(doc_request, True)

                if mark_author == doc_request['doc_author_id']:
                    # Якщо автор оновлення = автор документа, відправляємо на першу фазу
                    new_phase(doc_request, 1, [])
                else:
                    # Якщо ні, то створюємо автору документа mark_demand з позначкою "Не заперечую" (6)
                    # і відправляємо на нульову фазу:
                    zero_phase_id = get_zero_phase_id(doc_request['document_type'])
                    post_mark_demand(doc_request, doc_request['doc_author_id'], zero_phase_id, 6)

                if doc_request['doc_meta_type_id'] == 14:  # Проект наказу
                    change_decree_articles(doc_request['document'], json.loads(doc_request['decree_articles']))
                elif doc_request['doc_meta_type_id'] == 11:  # Вимоги клієнта
                    change_client_requirements(doc_request['document'],
                                               json.loads(doc_request['new_cr_list']),
                                               json.loads(doc_request['new_ar_list']))

                else:  # Зміна файлів у візуванні договору
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
                    if not is_already_approved(doc_request['document'], doc_request['path_to_answer_author']):
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

                add_contract_from_edms(doc_request, request.FILES)

                if is_auto_approved_phase_used(doc_request['document_type']):
                    completely_approved = is_doc_completely_approved(doc_request)
                    if completely_approved:
                        doc_request.update({'approved': completely_approved})
                    new_phase(doc_request, this_phase['phase'] + 1, [])
                else:
                    new_phase(doc_request, this_phase['phase'] + 1, [])

            # Взято у роботу
            elif doc_request['mark'] == '23':
                # Якщо це Договір, деактивуємо mark_demand і не робимо більше нічого.
                # Якщо у Договорі з'явиться фаза Виконано (у якій є підфаза Взято у роботу),
                # то цей крок можна переробити на перевірку mark_demand == 23 (бо у фазі Виконано mark_demand = 11)
                if doc_request['doc_meta_type_id'] == 5:
                    deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])
                else:
                    # Перетворюємо фазу документу на "Взято у роботу"
                    set_stage(doc_request['document'], 'in work')

                    # Деактивуємо MarkDemand всіх виконавців, якщо цю позначку поставив не супер-менеджер:
                    if doc_request['user_is_super_manager'] != 'true':
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
                            send_email_supervisor('Взято у роботу', doc_request, supervisor['mail'])

            # Підтвердження виконання
            elif doc_request['mark'] == '24':
                # Перетворюємо фазу документу на "Підтверджено"
                set_stage(doc_request['document'], 'confirm')
                # Деактивуємо MarkDemand цієї позначки
                deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])

                if doc_request['doc_meta_type_id'] == 1:
                    save_foyer_ranges(doc_request['document'])
                    # Заносимо дані цього документа в нову таблицю
                    # Відповідно до його stage робимо поля нередагуємими

            # Делегування mark_demand
            elif doc_request['mark'] == '25':
                mark_demand_instance = get_object_or_404(Mark_Demand, pk=doc_request['mark_demand_id'])
                mark_demand_instance.delegated_from_id = mark_demand_instance.recipient_id
                mark_demand_instance.recipient_id = doc_request['delegation_receiver_id']
                mark_demand_instance.save()

                approval_id = Doc_Approval.objects.values_list('id', flat=True) \
                    .filter(document_id=doc_request['document']) \
                    .filter(emp_seat_id=doc_request['employee_seat'])\
                    .filter(is_active=True)[0]
                approval_instance = get_object_or_404(Doc_Approval, pk=approval_id)
                approval_instance.emp_seat_id = doc_request['delegation_receiver_id']
                approval_instance.save()

                new_mail('new', [{'id': doc_request['delegation_receiver_id']}], doc_request)

            # Деактивація документа (відміна позначки approved)
            elif doc_request['mark'] == '26':
                doc_instance = get_object_or_404(Document, pk=doc_request['document'])
                doc_instance.approved = False
                doc_instance.save()

            # Реєстрація документа
            elif doc_request['mark'] == '27':
                if doc_request['doc_meta_type_id'] == 14:  # Наказ
                    # document_query = Document.objects.prefetch_related('decree_articles', 'decree_articles__responsibles')
                    post_order_from_edms(doc_request['document'], doc_request['registration_number'])
                else:
                    registered = change_registration_number(doc_request['document'], doc_request['registration_number'])
                    if not registered:
                        return HttpResponse('reg_unique_fail')

                deactivate_doc_mark_demands(doc_request, doc_request['document'], 27)
                new_phase(doc_request, this_phase['phase'] + 1, [])

            # На погодження
            elif doc_request['mark'] == '28':
                approvals = json.loads(doc_request['approvals'])
                # Створюємо MarkDemand для кожного користувача зі списку, більше нічого не змінюємо.

                for approval in approvals:
                    approval = vacation_check(approval['emp_seat_id'])
                    post_mark_demand(doc_request, approval, get_phase_id(doc_request), 2)
                    new_mail('new', [{'id': approval}], doc_request)

            # Видалення візуючого
            elif doc_request['mark'] == '30':
                # TODO Це захардкодена функція, яка працює до серйозних змін у бізнес-логіці документу!!!
                # Після видалення візуючого перевіряємо, чи є ще активні mark_demands візуючих,
                # якщо ні - відправляємо на наступну фазу.
                # Працює лише якщо всі візуючі знаходяться в одній і тій же фазі, і документ теж зараз в цій фазі.
                # Тобто у document_type=14 усі візуючі знаходяться у фазі 1 - яка іде відразу після створення документа.
                # Кнопка "видалити візуючого" активна лише під час цієї фази, тому захардкодений mark_id=17 працює.
                # Якщо візуючі будуть розділені на декілька фаз,
                # або перед візуючими зявиться ще одна фаза, ця функція зламається.
                # TODO Необхідно переробити, щоб ця функція перевіряла, на якій фазі ми знаходимось

                remaining_required_md = Mark_Demand.objects \
                    .filter(document_id=doc_request['document']) \
                    .filter(mark_id=17) \
                    .filter(is_active=True) \
                    .count()

                if remaining_required_md == 0:
                    new_phase(doc_request, this_phase['phase'] + 1, [])

            # На прийняття в роботу
            elif doc_request['mark'] == '31':
                recipients = json.loads(doc_request['employees_to_inform'])
                # Створюємо MarkDemand для кожного користувача зі списку, більше нічого не змінюємо.

                for recipient in recipients:
                    recipient = vacation_check(recipient['emp_seat_id'])
                    post_mark_demand(doc_request, recipient, get_phase_id(doc_request), 23)
                    new_mail('new', [{'id': recipient}], doc_request)

            # Нагадати про строки
            elif doc_request['mark'] == '34':
                remaining_required_mds = Mark_Demand.objects \
                    .filter(document_id=doc_request['document']) \
                    .exclude(mark_id=8) \
                    .filter(is_active=True)

                remaining_required_mds = [{
                    'id': md.id,
                    'emp_seat_id': md.recipient.id
                } for md in remaining_required_mds]

                for md in remaining_required_mds:
                    recipient = vacation_check(md['emp_seat_id'])
                    new_mail('remind', [{'id': recipient}], doc_request)

            # Оригінали отримано
            elif doc_request['mark'] == '33':
                check_lawyers_received(doc_request['document'])
                deactivate_doc_mark_demands(doc_request, doc_request['document'], 33)
                new_phase(doc_request, this_phase['phase'] + 1, [])

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
@try_except
def edms_get_deps(request):
    if request.method == 'GET':
        return HttpResponse(json.dumps(get_deps()))
    return HttpResponse(status=405)


@login_required(login_url='login')
@try_except
def edms_get_seats(request):
    if request.method == 'GET':
        return HttpResponse(json.dumps(get_seats()))
    return HttpResponse(status=405)


@login_required(login_url='login')
@try_except
def get_seats_for_select(request):
    if request.method == 'GET':
        return HttpResponse(json.dumps(get_seats('select')))
    return HttpResponse(status=405)


@login_required(login_url='login')
@try_except
def get_dep_seats(request, dep_id):
    if request.method == 'GET':
        return HttpResponse(json.dumps(get_dep_seats_list(dep_id)))
    return HttpResponse(status=405)


@login_required(login_url='login')
@try_except
def edms_bag_design(request):
    if request.method == 'GET':
        return HttpResponse(json.dumps(get_seats()))
    return HttpResponse(status=405)


@login_required(login_url='login')
@try_except
def edms_tables(request, meta_doc_type=''):
    if request.method == 'GET':

        doc_types_query = Document_Meta_Type.objects.filter(table_view=True).order_by('description')
        # doc_types_query = Document_Type.objects.filter(meta_doc_type__table_view=True)

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
@try_except
def edms_get_table_first(request, meta_doc_type=0, counterparty=0, doc_type=''):
    if request.method == 'GET':
        table = create_table_first(meta_doc_type, counterparty)

        return HttpResponse(json.dumps(table))
    return HttpResponse(status=405)


@try_except
def edms_get_table_all(request, meta_doc_type=0, counterparty=0, doc_type=''):
    if request.method == 'GET':
        table = create_table_all(meta_doc_type, counterparty)

        return HttpResponse(json.dumps(table))
    return HttpResponse(status=405)


@login_required(login_url='login')
@try_except
def change_text_module(request):
    set_doc_text_module(request)
    return HttpResponse(status=200)


@login_required(login_url='login')
@try_except
def edms_delegated(request):
    if request.method == 'GET':
        my_seats = get_my_seats(request.user.userprofile.id)

        subs = get_sub_emps(my_seats[0]['seat_id'], True)

        return render(request, 'edms/delegated/delegated.html', {
            'my_seats': my_seats, 'subs': subs
        })
    return HttpResponse(status=405)


@login_required(login_url='login')
@try_except
def edms_get_delegated_docs(request, emp, doc_meta_type, sub):
    if request.method == 'GET':
        return HttpResponse(json.dumps(get_delegated_docs(emp, sub, doc_meta_type)))
    return HttpResponse(status=405)


@login_required(login_url='login')
@try_except
def edms_get_free_times(request, page, meta_doc_type=0):
    response = get_free_times_table(request, page)
    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@try_except
def get_it_tickets(request, doc_type_version, page, meta_doc_type=0):
    response = get_it_tickets_table(request, doc_type_version, page)
    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@try_except
def get_doc_type_versions(request, doc_type_id):
    doc_type_versions = Document_Type_Version.objects\
        .filter(document_type_id=doc_type_id)\
        .filter(is_active=True)

    doc_type_versions_list = [{
        'id': doc_type_version.pk,
        'name': doc_type_version.description,
    } for doc_type_version in doc_type_versions]

    return HttpResponse(json.dumps(doc_type_versions_list))


@login_required(login_url='login')
@try_except
def get_all_employees(request):
    employees = UserProfile.objects \
        .filter(is_active=True) \
        .exclude(delete_from_noms=True) \
        .order_by('pip')

    employees_list = [{
        'id': employee.pk,
        'name': employee.pip + ' (' + employee.tab_number + ')',
    } for employee in employees]

    return HttpResponse(json.dumps(employees_list))


@login_required(login_url='login')
@try_except
def del_foyer_range(request, pk):
    range = get_object_or_404(Doc_Foyer_Range, pk=pk)
    range.is_active = False
    range.save()

    return HttpResponse(200)


@login_required(login_url='login')
@try_except
def save_foyer_range(request):
    sent_range = json.loads(request.POST['range'])
    if 'id' in sent_range:
        new_range = get_object_or_404(Doc_Foyer_Range, pk=sent_range['id'])
        # new_range.out_datetime = datetime.strptime(sent_range['out'], "%Y-%m-%dT%H:%M:%S.%fz") if sent_range['out'] != '' else '',
        # print(new_range.out_datetime)
        # new_range.in_datetime = datetime.strptime(sent_range['in'], "%Y-%m-%dT%H:%M:%S.%fz") if sent_range['in'] != '' else '',

        new_range.out_datetime = sent_range['out'] if sent_range['out'] != '' else None
        new_range.in_datetime = sent_range['in'] if sent_range['in'] != '' else None
    else:
        new_range = Doc_Foyer_Range(document_id=request.POST['doc_id'],
                                    out_datetime=sent_range['out'] if sent_range['out'] != '' else None,
                                    in_datetime=sent_range['in'] if sent_range['in'] != '' else None,
                                    queue_in_doc=request.POST['queue']
                                    )
    new_range.save()
    return HttpResponse(new_range.pk)


@transaction.atomic
@login_required(login_url='login')
@try_except
def del_approval(request, approval_id):
    approval_instance = get_object_or_404(Doc_Approval, pk=approval_id)
    deactivated = deactivate_approval(request, approval_instance)

    if deactivated == 'ok':
        # Надсилаємо листа про видалення зі списку візуючих
        info_for_mail = {'doc_type_name': approval_instance.document.document_type.description,
                         'document': request.POST['doc_id']}
        new_mail('deleted_from_approvals', [{'id': approval_instance.emp_seat.id}], info_for_mail)

    return HttpResponse(deactivated)


@login_required(login_url='login')
@try_except
def add_approvals(request):
    return HttpResponse(post_new_doc_approvals(request))


@login_required(login_url='login')
@try_except
def get_add_contract_reg_number(request, main_contract_id):
    return HttpResponse(get_additional_contract_reg_number(main_contract_id))


@login_required(login_url='login')
@try_except
def get_client_requirements_for_choose(request, counterparty_id):
    return HttpResponse(json.dumps(get_client_requirements_list(counterparty_id)))
