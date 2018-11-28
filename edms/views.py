from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, HttpResponseForbidden, QueryDict
from django.contrib.auth.decorators import login_required
from django.utils.timezone import datetime
from django.utils import timezone
import json
import pytz


from accounts import models as accounts  # import models Department, UserProfile
from .models import Seat, Employee_Seat, Document, File, Document_Path
# from .models import Active_Docs_View, Archive_Docs_View
from .models import Document_Type, Document_Type_Permission, Mark
from .models import Free_Time_Periods, Carry_Out_Info, Carry_Out_Items, Mark_Demand
from .forms import DepartmentForm, SeatForm, UserProfileForm, EmployeeSeatForm, DocumentForm, DocumentPathForm
from .forms import FreeTimeForm, CarryOutItemsForm, CarryOutInfoForm, ChiefMarkDemandForm, ResolutionForm
from .forms import DTPDeactivateForm, DTPAddForm, NewFileForm


# При True у списках відображаться і ті документи, які знаходяться в режимі тестування.
testing = False


def convert_to_localtime(utctime, frmt):
    if frmt == 'day':
        fmt = '%d.%m.%Y'
    else:
        fmt = '%d.%m.%Y %H:%M'

    utc = utctime.replace(tzinfo=pytz.UTC)
    localtz = utc.astimezone(timezone.get_current_timezone())
    return localtz.strftime(fmt)


# Функція, яка рекурсією шукає всіх підлеглих посади користувача і їх підлеглих
def get_subs_list(seat):
    seats = [{'id': seat.id} for seat in Seat.objects.filter(chief_id=seat)]  # Знаходимо підлеглих посади
    temp_seats = []
    if seats:  # якщо підлеглі є:
        for seat in seats:
            temp_seats.append({'id': seat['id']})  # додамо кожного підлеглого у список
            new_seats = get_subs_list(seat['id'])  # і шукаємо його підлеглих
            if new_seats is not None:  # якщо підлеглі є, додаємо і їх у список
                for new_seat in new_seats:
                    temp_seats.append({'id': new_seat['id']})
        return temp_seats
    else:
        return None


# Функція, яка рекурсією шукає всіх начальників посади користувача і їх начальників
def get_chiefs_list(seat):
    # Знаходимо id посади начальника
    chief_id = (Seat.objects.only('chief_id').filter(id=seat).first()).chief_id
    # Знаходимо людинопосаду начальника
    chief = [{
        'id': empSeat.id,
        'name': empSeat.employee.pip,
        'seat': empSeat.seat.seat if empSeat.is_main is True else empSeat.seat.seat + ' (в.о.)',
    } for empSeat in Employee_Seat.objects.filter(seat_id=chief_id).filter(is_active=True).filter(employee__on_vacation=False)]

    temp_chiefs = []
    if chief_id is not None:  # якщо начальник є:
        temp_chiefs.append(chief[0])
        new_chiefs = get_chiefs_list(chief_id)  # і шукаємо його начальника і так далі
        if new_chiefs is not None:  # якщо начальники є, додаємо і їх у список
            for new_chief in new_chiefs:
                temp_chiefs.append({
                    'id': new_chief['id'],
                    'name': new_chief['name'],
                    'seat': new_chief['seat']
                })
        return temp_chiefs
    else:
        return None


# Функція, яка повертає список всіх актуальних посад юзера
def get_my_seats(emp_id):
    my_seats = [{  # Список посад юзера
        'id': empSeat.id,
        'seat_id': empSeat.seat_id,
        'seat': empSeat.seat.seat if empSeat.is_main else '(в.о.) ' + empSeat.seat.seat,
    } for empSeat in Employee_Seat.objects.filter(employee_id=emp_id).filter(is_active=True)]
    return my_seats


# Функція, яка постить файли (для edms_mark та edms_my_docs)
def handle_files(path_id, post, files):
    file_request = post.copy()
    file_request.update({'document_path': path_id})
    file_request.update({'name': 'file'})

    file_form = NewFileForm(file_request, files)
    if file_form.is_valid():
        document_path = file_form.cleaned_data['document_path']
        for f in files.getlist('file'):
            File.objects.create(
                document_path=document_path,
                file=f,
                name=f.name
            )


@login_required(login_url='login')
def edms_main(request):
    if request.method == 'GET':
        return render(request, 'edms/main.html')
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_hr(request):
    if request.method == 'GET':

        deps = [{       # Список відділів для форм на сторінці відділу кадрів
            'id': dep.pk,
            'dep': dep.name,
            'text': dep.text,
            # 'chief': 'Не внесено' if dep.manager is None else dep.manager.last_name + ' ' + dep.manager.first_name,
            # 'chief_id': 0 if dep.manager is None else dep.manager.id,
        } for dep in accounts.Department.objects.filter(is_active=True).order_by('name')]

        seats = [{       # Список посад для форм на сторінці відділу кадрів
            'id': seat.pk,
            'seat': seat.seat,
            'dep': 'Не внесено' if seat.department is None else seat.department.name,
            'dep_id': 0 if seat.department is None else seat.department.id,
            'chief': 'Не внесено' if seat.chief is None else seat.chief.seat,
            'chief_id': 0 if seat.chief is None else seat.chief.id,
        } for seat in Seat.objects.all().filter(is_active=True).order_by('seat')]

        # Додаємо поле "вакансія" у список посад (посада, де вакансія = True, буде виділятися червоним)
        for seat in seats:
            is_vacant = Employee_Seat.objects.filter(seat_id=seat['id']).filter(is_active=True).first()
            seat['is_vacant'] = 'true' if is_vacant is None else 'false'

        emps = [{       # Список працівників для форм на сторінці відділу кадрів
            'id': emp.pk,
            'emp': emp.pip,
            'on_vacation': 'true' if emp.on_vacation else 'false',
            'acting': 0 if emp.acting is None else emp.acting.pip,
            'acting_id': 0 if emp.acting is None else emp.acting.id,
        } for emp in accounts.UserProfile.objects.only(
            'id', 'pip', 'on_vacation', 'acting').filter(is_active=True).order_by('pip')]

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
def edms_administration(request):
    if request.method == 'GET':
        my_seats = get_my_seats(request.user.userprofile.id)
        seats = [{  # Список посад для форм на сторінці відділу кадрів
            'id': seat.pk,
            'seat': seat.seat,
        } for seat in Seat.objects.filter(is_active=True).order_by('seat')]
        marks = [{
            'id': mark.pk,
            'mark': mark.mark,
        } for mark in Mark.objects.filter(is_active=True)]
        return render(request, 'edms/administration/administration.html', {
            'my_seats': my_seats,
            'seats': seats,
            'marks': marks,
        })

    if request.method == 'POST':
        form = DTPAddForm(request.POST)
        if form.is_valid():
            new_dtp = form.save()
            return HttpResponse(new_dtp.pk)

    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_deactivate_permission(request, pk):
    permission = get_object_or_404(Document_Type_Permission, pk=pk)
    if request.method == 'POST':
        form = DTPDeactivateForm(request.POST, instance=permission)
        if form.is_valid():
            form.save()
            return redirect('administration.html')


@login_required(login_url='login')
def edms_get_types(request, pk):
    # Отримуємо ід посади з ід людинопосади
    seat_id = Employee_Seat.objects.filter(id=pk).values_list('seat_id')[0][0]

    if request.method == 'GET':
        if request.user.userprofile.is_it_admin:
            doc_types = [{  # Список документів, створених даним юзером
                'id': doc_type.id,
                'description': doc_type.description,
                'creator': '' if doc_type.creator_id is None else doc_type.creator.employee.pip,
            } for doc_type in Document_Type.objects.filter(testing=testing)]
            return HttpResponse(json.dumps(doc_types))
        else:
            doc_types = [{  # Список документів, створених даним юзером
                'id': doc_type.id,
                'description': doc_type.description,
                'creator': '' if doc_type.creator_id is None else doc_type.creator.employee.pip,
            } for doc_type in Document_Type.objects.filter(creator_id=seat_id)]

            if request.user.userprofile.is_hr:
                hr_doc_types = [{  # Список документів, створених даним юзером
                    'id': doc_type.id,
                    'description': doc_type.description,
                    'creator': '' if doc_type.creator_id is None else doc_type.creator.employee.pip,
                } for doc_type in Document_Type.objects.filter(creator_id=None).filter(testing=testing)]
                doc_types = doc_types + hr_doc_types

            return HttpResponse(json.dumps(doc_types))


@login_required(login_url='login')
def edms_get_type_info(request, pk):
    # Отримуємо ід типу документу
    doc_type_id = Document_Type.objects.filter(id=pk).values_list('id')[0][0]

    if request.method == 'GET':
        permissions = [{  # Список дозволів для посад для цього документу
            'id': permission.id,
            'seat_id': permission.seat.id,
            'seat': permission.seat.seat,
            'mark_id': permission.mark.id,
            'mark': permission.mark.mark,
        } for permission in Document_Type_Permission.objects
            .filter(document_type_id=doc_type_id)
            .filter(is_active=True)]

        return HttpResponse(json.dumps(permissions))


@login_required(login_url='login')
def edms_hr_emp(request, pk):       # changes in employee row
    post = get_object_or_404(accounts.UserProfile, pk=pk)
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
    post = get_object_or_404(accounts.Department, pk=pk)
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
def edms_get_emp_seats(request, pk):
    emp = get_object_or_404(accounts.UserProfile, pk=pk)
    if request.method == 'GET':
        emp_seats = [{
            'id': empSeat.pk,
            'emp_seat': empSeat.seat.seat if empSeat.is_main is True else empSeat.seat.seat + ' (в.о.)',
            'seat_id': empSeat.seat.pk,
            'emp_id': empSeat.employee.pk,
        } for empSeat in
            Employee_Seat.objects.only('id', 'seat', 'employee').filter(employee_id=emp).filter(is_active=True)]

        return HttpResponse(json.dumps(emp_seats))


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
def edms_get_doc(request, pk):
    doc = get_object_or_404(Document, pk=pk)
    if request.method == 'GET':
        # Шлях, пройдений документом
        path = [{
            'id': path.id,
            'time': convert_to_localtime(path.timestamp, 'time'),
            'mark_id': path.mark_id,
            'mark': path.mark.mark,
            'emp_seat_id': path.employee_seat_id,
            'emp': path.employee_seat.employee.pip,
            'seat': path.employee_seat.seat.seat if path.employee_seat.is_main else '(в.о.) ' + path.employee_seat.seat.seat,
            'comment': path.comment,
        } for path in Document_Path.objects.filter(document_id=doc.pk).order_by('-timestamp')]

        # Перебираємо шлях документа в пошуках резолюцій і додаємо їх до відповідного запису в path
        for step in path:
            if step['mark_id'] == 10:
                resolutions = [{
                    'id': res.id,
                    'emp_seat_id': res.recipient.id,
                    'emp': res.recipient.employee.pip,
                    'seat': res.recipient.seat.seat,
                    'comment': res.comment,
                } for res in Mark_Demand.objects.filter(document_path_id=step['id'])]
                step['resolutions'] = resolutions

        # Перебираємо шлях документа в пошуках файлів і додаємо їх до відповідного запису в path
        for step in path:
            files = [{
                'id': file.id,
                'file': file.file.name,
                'name': file.name,
                'path_id': file.document_path.id,
                'mark_id': file.document_path.mark.id,
            } for file in File.objects.filter(document_path_id=step['id'])]
            step['files'] = files

        # В кого на черзі документ
        flow = [{
            'id': demand.id,
            'emp_seat_id': demand.recipient.id,
            'emp': demand.recipient.employee.pip,
            'seat': demand.recipient.seat.seat if demand.recipient.is_main else '(в.о.) ' + demand.recipient.seat.seat,
            'expected_mark': demand.mark_id,
        } for demand in Mark_Demand.objects.filter(document_id=doc.pk).filter(is_active=True)]

        doc_info = {
            'path': path,
            'flow': flow
        }

        # Інфа, яка стосується окремих видів документів
        if doc.document_type_id == 1:  # Звільнююча перепустка
            info = [{
                'free_time': datetime.strftime(item.free_day, '%d.%m.%Y'),
                'text': item.document.text,
            } for item in Free_Time_Periods.objects.filter(document_id=doc.id)]

            doc_info.update({
                'free_time': info[0]['free_time'],
                'text': info[0]['text'],
            })

        if doc.document_type_id == 2:  # Матеріальний пропуск
            info = [{
                'carry_out_day': datetime.strftime(item.carry_out_day, '%d.%m.%Y'),
                'gate': item.gate,
                'text': item.document.text,
            } for item in Carry_Out_Info.objects.filter(document_id=doc.id)]

            items = [{
                'id': item.id,
                'item_name': item.item_name,
                'quantity': item.quantity,
                'measurement': item.measurement,
            } for item in Carry_Out_Items.objects.filter(document_id=doc.id)]

            doc_info.update({
                'carry_out_day': info[0]['carry_out_day'],
                'gate': info[0]['gate'],
                'text': info[0]['text'],
                'carry_out_items': items,
            })

        if doc.document_type_id == 3:  # Службова записка

            # Ід і ім’я керівника-отримувача, текст службової
            info = [{
                'recipient': item.recipient.employee.pip,
                'recipient_seat': item.recipient.seat.seat if item.recipient.is_main else '(в.о.) ' + item.recipient.seat.seat,
                'text': item.document.text,
            } for item in Mark_Demand.objects.filter(document_id=doc.id)]

            doc_info.update({
                'recipient': info[0]['recipient'],
                'recipient_seat': info[0]['recipient_seat'],
                'text': info[0]['text'],
            })

        return HttpResponse(json.dumps(doc_info))


@login_required(login_url='login')
def edms_my_docs(request):

    if request.method == 'GET':
        my_seats = get_my_seats(request.user.userprofile.id)

        new_docs = [{  # Список документів, які може створити юзер
            'id': doc_type.id,
            'description': doc_type.description,
        } for doc_type in Document_Type.objects
            .filter(testing=testing)]  # В режимі тестування показуються типи документів, що тестуються

        my_docs = [{  # Список документів, створених даним юзером
            'id': path.document.id,
            'type': path.document.document_type.description,
            'type_id': path.document.document_type.id,
            'date': convert_to_localtime(path.timestamp, 'day'),
            'emp_seat_id': path.employee_seat.id,
            'author': request.user.userprofile.pip,
            'author_seat_id': path.employee_seat.id,
        } for path in Document_Path.objects
            .filter(mark=1).filter(employee_seat__employee_id=request.user.userprofile.id)  # Створено користувачем
            .filter(document__closed=False)  # Активний документ
            .filter(document__document_type__testing=testing)  # У режимі тестування показуються лише тестовані типи
        ]

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
        } for demand in Mark_Demand.objects
            .filter(recipient_id__employee_id=request.user.userprofile.id)  # документ призначений користувачу
            .filter(is_active=True)
            .filter(document__document_type__testing=testing)  # У режимі тестування показуються лише тестовані типи
            .order_by('document_id')]

        return render(request, 'edms/my_docs/my_docs.html', {
            'new_docs': new_docs, 'my_docs': my_docs, 'my_seats': my_seats, 'work_docs': work_docs
        })

    elif request.method == 'POST':

        # копіюємо запит, щоб зробити його мутабельним і додаємо поле "користувач"
        doc_request = request.POST.copy()
        doc_request.update({'employee': request.user.userprofile.id})

        # якщо клієнт постить нову звільнюючу
        if request.POST['document_type'] == '1':
            doc_form = DocumentForm(doc_request)
            if doc_form.is_valid():

                # Зберігаємо новий документ і отримуємо його id
                new_doc = doc_form.save()

                # Додаємо в запит ід нового документу:
                doc_request.update({'document': new_doc.pk})

                # вносимо новий документ і запис у таблицю Free_Time_Periods
                free_time_form = FreeTimeForm(doc_request)
                if free_time_form.is_valid():
                    free_time_form.save()
                    return HttpResponse(new_doc.pk)

        # якщо клієнт постить новий мат.пропуск
        if request.POST['document_type'] == '2':
            doc_form = DocumentForm(doc_request)
            if doc_form.is_valid():

                # отримуємо список цінностей на виніс з запиту в масив
                carry_out_items = json.loads(request.POST['carry_out_items'])

                # Зберігаємо новий документ і отримуємо його id
                new_doc = doc_form.save()
                doc_request.update({'document': new_doc.pk})

                # Записуємо інформацію про виніс у carry_out_info
                chief_mark_demand_form = CarryOutInfoForm(doc_request)
                if chief_mark_demand_form.is_valid():
                    chief_mark_demand_form.save()

                # Для кожного пункту в списку цінностей створюємо
                # і постимо запит у carry_out_items
                for item in carry_out_items:
                    doc_request.update({'item_name': item['name']})
                    doc_request.update({'quantity': item['quantity']})
                    doc_request.update({'measurement': item['measurement']})
                    carry_out_form = CarryOutItemsForm(doc_request)
                    if carry_out_form.is_valid():
                        carry_out_form.save()
                return HttpResponse(new_doc.pk)

        # якщо клієнт постить нову службову записку
        if request.POST['document_type'] == '3':
            doc_form = DocumentForm(doc_request)
            if doc_form.is_valid():

                # Зберігаємо новий документ і отримуємо його id
                new_doc = doc_form.save()
                doc_request.update({'document': new_doc.pk})
                # Додаємо у запит вид позначку 'Погоджено', яку очікуємо від шефа:
                doc_request.update({'mark': 2})

                # Заносимо документ у mark_demand
                chief_mark_demand_form = ChiefMarkDemandForm(doc_request)
                if chief_mark_demand_form.is_valid():
                    chief_mark_demand_form.save()

                # Додаємо файли, якщо такі є:
                if len(request.FILES) > 0:
                    new_path = Document_Path.objects.filter(document_id=new_doc.pk).filter(mark_id=1).first()
                    handle_files(new_path.pk, request.POST, request.FILES)

                return HttpResponse(json.dumps(new_doc.pk))

    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_archive(request):
    if request.method == 'GET':
        my_seats = get_my_seats(request.user.userprofile.id)

        my_archive = [{  # Список документів, створених даним юзером
            'id': path.document.id,
            'type': path.document.document_type.description,
            'type_id': path.document.document_type.id,
            'date': convert_to_localtime(path.timestamp, 'day'),
            'emp_seat_id': path.employee_seat.id,
            'author_seat_id': path.employee_seat.id,
        } for path in Document_Path.objects
            .filter(mark=1).filter(employee_seat__employee_id=request.user.userprofile.id)  # Створено користувачем
            .filter(document__closed=True)  # Закритий документ
            .filter(document__document_type__testing=testing)  # У режимі тестування показуються лише тестовані типи
        ]

        work_archive_with_duplicates = [{  # Список документів, які були у роботі користувача
            'id': path.document_id,
            'type': path.document.document_type.description,
            'type_id': path.document.document_type_id,
            'date': convert_to_localtime(path.document.date, 'day'),
            'emp_seat_id': path.employee_seat_id,
            'author': path.document.employee_seat.employee.pip,
            'author_seat_id': path.document.employee_seat_id,
        } for path in Document_Path.objects.distinct()
            .filter(employee_seat_id__employee_id=request.user.userprofile.id)  # документ був у користувача
            .filter(document__document_type__testing=testing)  # У режимі тестування показуються лише тестовані типи
            .exclude(document__employee_seat__employee=request.user.userprofile.id)]  # Автор не користувач

        # Позбавляємось дублікатів:
        work_archive = list({item["id"]: item for item in work_archive_with_duplicates}.values())

        return render(request, 'edms/archive/archive.html', {
            'my_seats': my_seats, 'my_archive': my_archive, 'work_archive': work_archive,
        })
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
def edms_get_sub_docs(request, pk):
    if request.method == 'GET':
        # Отримуємо ід посади з ід людинопосади
        seat_id = Employee_Seat.objects.filter(id=pk).values_list('seat_id')[0][0]

        # Список всіх підлеглих користувача:
        subs_list = get_subs_list(int(seat_id))

        # Шукаємо документи кожного підлеглого
        sub_docs = []
        if subs_list:
            for sub in subs_list:
                docs = [{  # Список документів у роботі, створених підлеглими юзера
                    'id': path.document_id,
                    'type': path.document.document_type.description,
                    'type_id': path.document.document_type_id,
                    'date': datetime.strftime(path.timestamp, '%d.%m.%Y'),
                    'author_seat_id': path.employee_seat_id,
                    'author': path.employee_seat.employee.pip,
                    'dep': path.employee_seat.seat.department.name,
                    'emp_seat_id': int(pk),
                    'closed': path.document.closed,
                } for path in Document_Path.objects
                    .filter(mark_id=1)
                    .filter(employee_seat__seat_id=sub['id'])
                    .filter(document__document_type__testing=testing)]
                if docs:
                    for doc in docs:
                        sub_docs.append(doc)
        return HttpResponse(json.dumps(sub_docs))

    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_mark(request):
    if request.method == 'POST':
        # Якщо документ намагаються видалити, шукаємо, чи хтось не відреагував на нього
        # Якщо позначки від інших користувачів є - відмовляємо у видаленні
        if request.POST['mark'] == '13':
            deletable = Document_Path.objects\
                .filter(document_id=request.POST['document'])\
                .exclude(employee_seat_id=request.POST['employee_seat'])

            if len(deletable) > 0:
                return HttpResponse('not deletable')

        path_form = DocumentPathForm(request.POST)
        if path_form.is_valid():
            new_path = path_form.save()

            # Додаємо файли, якщо такі є:
            if len(request.FILES) > 0:
                handle_files(new_path.pk, request.POST, request.FILES)

            return HttpResponse(new_path.pk)


@login_required(login_url='login')
def edms_resolution(request):
    if request.method == 'POST':

        # отримуємо список резолюцій з request і публікуємо їх усі у базу
        resolutions = json.loads(request.POST['resolutions'])
        res_request = request.POST.copy()
        for res in resolutions:
            res_request.update({'recipient': res['recipient_id']})
            res_request.update({'comment': res['comment']})
            resolution_form = ResolutionForm(res_request)
            if resolution_form.is_valid():
                new_res = resolution_form.save()
            else:
                return HttpResponse(status=405)
        return HttpResponse('')