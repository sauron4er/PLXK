from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.utils.timezone import datetime
from django.utils import timezone
import json
import pytz

from accounts import models as accounts  # import models Department, UserProfile
from .models import Seat, Employee_Seat, Document, Document_Path, Active_Docs_View, Archive_Docs_View, Document_Flow
from .models import Free_Time_Periods, Carry_Out_Info
from .forms import DepartmentForm, SeatForm, UserProfileForm, EmployeeSeatForm, DocumentForm, DocumentPathForm, DocumentFlowForm
from .forms import FreeTimeForm, CarryOutItemsForm, CarryOutInfoForm


def convert_to_localtime(utctime):
    fmt = '%d.%m.%Y %H:%M'
    utc = utctime.replace(tzinfo=pytz.UTC)
    localtz = utc.astimezone(timezone.get_current_timezone())
    return localtz.strftime(fmt)


# Функція, яка рекурсією шукає всіх підлеглих і їх підлеглих посади користувача
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
            'chief': 'Не внесено' if dep.manager is None else dep.manager.last_name + ' ' + dep.manager.first_name,
            'chief_id': 0 if dep.manager is None else dep.manager.id,
        } for dep in accounts.Department.objects.filter(is_active=True).order_by('name')]

        seats = [{       # Список посад для форм на сторінці відділу кадрів
            'id': seat.pk,
            'seat': seat.seat,
            'dep': 'Не внесено' if seat.department is None else seat.department.name,
            'dep_id': 0 if seat.department is None else seat.department.id,
            'chief': 'Не внесено' if seat.chief is None else seat.chief.seat,
            'chief_id': 0 if seat.chief is None else seat.chief.id,
            'is_free_time_chief': 'true' if seat.is_free_time_chief else 'false',
            'is_carry_out_chief': 'true' if seat.is_carry_out_chief else 'false',
        } for seat in Seat.objects.all().filter(is_active=True).order_by('seat')]

        # Додаємо поле "вакансія" у список посад (посада, де вакансія = True, буде виділятися червоним)
        for seat in seats:
            is_vacant = Employee_Seat.objects.filter(seat_id=seat['id']).filter(is_active=True).first()
            seat['is_vacant'] = 'true' if is_vacant is None else 'false'

        emps = [{       # Список працівників для форм на сторінці відділу кадрів
            'id': emp.user.pk,
            'emp_id': emp.pk,
            'emp': emp.pip,
            'on_vacation': 'true' if emp.on_vacation else 'false',
            'acting': 0 if emp.acting is None else emp.acting.pip,
            'acting_id': 0 if emp.acting is None else emp.acting.id,
        } for emp in accounts.UserProfile.objects.only(
            'id', 'pip', 'on_vacation', 'acting').filter(is_active=True).order_by('pip')]

        emps_seats = [{
            'id': empSeat.pk,
            'emp_seat': empSeat.seat.seat,
            'emp_seat_id': empSeat.seat.pk,
            'emp_id': empSeat.employee.pk,
        } for empSeat in
            Employee_Seat.objects.only('id', 'seat', 'employee').filter(is_active=True)]

        new_dep_form = DepartmentForm()  # django форма додачі нового відділу
        new_seat_form = SeatForm()  # django форма додачі нової посади

        # users_with_profile = (user.user.id for user in accounts.UserProfile.objects.only(
        #     'user__id').filter(user__is_active=True))  # список юзерів, для яких створено профіль
        # new_users = [{  # список юзерів, для яких не створено профіль
        #     'id': user.id,
        #     'name': user.last_name + ' ' + user.first_name,
        # } for user in accounts.User.objects.all().filter(
        #     is_active=True).exclude(id__in=users_with_profile).order_by('last_name')]

        return render(request, 'edms/hr/hr.html', {
            'deps': deps,
            'seats': seats,
            'emps': emps,
            'emps_seats': emps_seats,

            'new_dep_form': new_dep_form,
            'new_seat_form': new_seat_form,
            # 'new_users': new_users,
        })

    elif request.method == 'POST':

        if 'new_dep' in request.POST:
            form = DepartmentForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('hr.html')

        if 'new_seat' in request.POST:
            form = SeatForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('hr.html')

        if 'new_emp_seat' in request.POST:
            form_employee_seat = EmployeeSeatForm(request.POST)
            if form_employee_seat.is_valid():
                form_employee_seat.save()
                return redirect('hr.html')

    return HttpResponse(status=405)


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
        form = EmployeeSeatForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect('hr.html')


@login_required(login_url='login')
def edms_my_docs(request):

    if request.method == 'GET':
        my_seats = [{  # Список посад юзера
            'id': empSeat.id,
            'seat': empSeat.seat.seat if empSeat.is_main else '(в.о.) ' + empSeat.seat.seat,
        } for empSeat in Employee_Seat.objects.filter(employee_id=request.user.userprofile.id).filter(is_active=True)]

        my_docs = [{  # Список документів, створених даним юзером
            'id': doc.id,
            'type': doc.description,
            'type_id': doc.type_id,
            'date': doc.date,
            'emp_seat_id': doc.employee_seat_id,
            'author_seat_id': doc.employee_seat_id,
        } for doc in Active_Docs_View.objects.filter(employee_id=request.user.userprofile.id)]

        work_docs = [{  # Список документів, що очікують на реакцію користувача
            'id': doc.document_id,
            'type': doc.document.document_type.description,
            'type_id': doc.document.document_type_id,
            'flow_id': doc.id,
            'emp_seat_id': doc.employee_seat_id,
            'expected_mark': doc.expected_mark_id,
            'author': doc.document.employee_seat.employee.pip,
            'author_seat_id': doc.document.employee_seat_id,
        } for doc in Document_Flow.objects.
            filter(employee_seat_id__employee_id=request.user.userprofile.id).  # документ призначений користувачу
            filter(is_active=True).order_by('document_id')]

        # Додаємо поле "дата" у список документів у черзі
        for doc in work_docs:
            date = Document_Path.objects.filter(document_id=doc['id']).filter(mark_id=1).values_list('timestamp')[0][0]
            doc['date'] = datetime.strftime(date, '%d.%m.%Y')

        return render(request, 'edms/my_docs/my_docs.html', {
            'my_docs': my_docs, 'my_seats': my_seats, 'work_docs': work_docs
        })

    elif request.method == 'POST':

        # копіюємо запит, щоб зробити його мутабельним і додаємо поле "користувач"
        doc_request = request.POST.copy()
        doc_request.update({'employee': request.user.userprofile.id})

        # якщо клієнт постить нову звільнюючу
        if 'new_free_time' in request.POST:
            doc_form = DocumentForm(doc_request)
            if doc_form.is_valid():

                # Отримуємо ід нового документу
                new_doc = doc_form.save()

                # Додаємо в запит ід нового документу:
                doc_request.update({'document': new_doc.pk})

                # вносимо новий документ і запис у таблицю Free_Time_Periods
                free_time_form = FreeTimeForm(doc_request)
                if free_time_form.is_valid():
                    free_time_form.save()
                    return HttpResponse(new_doc.pk)

        # якщо клієнт постить новий мат.пропуск
        if 'new_carry_out' in request.POST:
            doc_form = DocumentForm(doc_request)
            if doc_form.is_valid():

                # отримуємо список цінностей на виніс з запиту в масив
                carry_out_items = json.loads(request.POST['carry_out_items'])

                # Отримуємо ід нового документу
                new_doc = doc_form.save()
                doc_request.update({'document': new_doc.pk})

                # Записуємо інформацію про виніс у carry_out_info
                carry_out_info_form = CarryOutInfoForm(doc_request)
                if carry_out_info_form.is_valid():
                    carry_out_info_form.save()

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

    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_get_doc(request, pk):
    doc = get_object_or_404(Document, pk=pk)
    if request.method == 'GET':
        path = [{  # Шлях, пройдений документом
            'id': path.id,
            'time': convert_to_localtime(path.timestamp),
            # 'time': datetime.strftime(path.timestamp, '%d.%m.%Y, %H:%M'),
            'mark_id': path.mark_id,
            'mark': path.mark.mark,
            'emp_seat_id': path.employee_seat_id,
            'emp': path.employee_seat.employee.pip,
            'seat': path.employee_seat.seat.seat if path.employee_seat.is_main else '(в.о.) ' + path.employee_seat.seat.seat,
            # 'seat': path.employee_seat.seat.seat,
            'comment': path.comment,
        } for path in Document_Path.objects.filter(document_id=doc.pk).order_by('-timestamp')]

        flow = [{  # В кого на черзі документ
            'id': flow.id,
            'emp_seat_id': flow.employee_seat_id,
            'emp': flow.employee_seat.employee.pip,
            'seat': flow.employee_seat.seat.seat if flow.employee_seat.is_main else '(в.о.) ' + flow.employee_seat.seat.seat,
            'expected_mark': flow.expected_mark_id,
        } for flow in Document_Flow.objects.filter(document_id=doc.pk).filter(is_active=True)]

        if doc.document_type_id == 1:  # Звільнююча перепустка
            free_time = datetime.strftime(
                Free_Time_Periods.objects.filter(document_id=doc.id).values_list('free_day')[0][0], '%d.%m.%Y'
            )

            destination = Document.objects.filter(id=doc.id).values_list('text')[0][0]

            doc_info = {
                'path': path,
                'flow': flow,
                'free_time': free_time,
                'destination': destination
            }

            return HttpResponse(json.dumps(doc_info))

        if doc.document_type_id == 2:  # Матеріальний пропуск
            carry_out_day = datetime.strftime(
                Carry_Out_Info.objects.filter(document_id=doc.id).values_list('carry_out_day')[0][0], '%d.%m.%Y'
            )
            gate = Carry_Out_Info.objects.filter(document_id=doc.id).values_list('gate')[0][0]
            destination = Document.objects.filter(id=doc.id).values_list('text')[0][0]

            doc_info = {
                'path': path,
                'flow': flow,
                'carry_out_day': carry_out_day,
                'gate': gate,
                'destination': destination
            }

            return HttpResponse(json.dumps(doc_info))


@login_required(login_url='login')
def edms_mark(request):
    if request.method == 'POST':
        path_form = DocumentPathForm(request.POST)

        if path_form.is_valid():
            # деактивуємо даний запис flow, якщо запис у path не "коментар"
            # якщо запис "закрито" - деактивуємо всі записи у flow силами бд
            if request.POST['mark'] not in ('4', '7'):
                flow_request = request.POST.copy()  # Копіюємо запит, щоб він став мутабельний
                flow_request.update({'is_active': False})

                flow = get_object_or_404(Document_Flow, pk=flow_request['flow_id'])
                flow_form = DocumentFlowForm(flow_request, instance=flow)

                if flow_form.is_valid():
                    flow_form.save()

        new_path = path_form.save()
        return HttpResponse(new_path.pk)


@login_required(login_url='login')
def edms_archive(request):
    if request.method == 'GET':
        # TODO перетворити my_seats в окремий компонент, який буде використовуватися на сторінках my_docs та archive (зараз код повторюється)
        my_seats = [{  # Список посад юзера
            'id': empSeat.id,
            'seat': empSeat.seat.seat if empSeat.is_main else '(в.о.) ' + empSeat.seat.seat,
        } for empSeat in Employee_Seat.objects.filter(employee_id=request.user.userprofile.id).filter(is_active=True)]

        my_archive = [{  # Список документів, створених даним юзером
            'id': doc.id,
            'type': doc.description,
            'type_id': doc.type_id,
            'date': doc.date,
            'emp_seat_id': doc.employee_seat_id,
            'author_seat_id': doc.employee_seat_id,
        } for doc in Archive_Docs_View.objects.filter(employee_id=request.user.userprofile.id)]

        work_archive_duplicates = [{  # Список документів, які були у роботі користувача
            'id': doc.document_id,
            'type': doc.document.document_type.description,
            'type_id': doc.document.document_type_id,
            'emp_seat_id': doc.employee_seat_id,
            'author': doc.document.employee_seat.employee.pip,
            'author_seat_id': doc.document.employee_seat_id,
        } for doc in Document_Flow.objects.distinct().
            filter(employee_seat_id__employee_id=request.user.userprofile.id).  # документ був у користувача
            filter(document_id__closed=True).  # Документ закрито
            exclude(document__employee_seat__employee=request.user.userprofile.id)]  # Автор не користувач

        # Позбавляємось дублікатів:
        work_archive = list({item["id"]: item for item in work_archive_duplicates}.values())

        return render(request, 'edms/archive/archive.html', {
            'my_seats': my_seats, 'my_archive': my_archive, 'work_archive': work_archive,
        })
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_sub_docs(request):
    if request.method == 'GET':
        # TODO перетворити my_seats в окремий компонент, який буде використовуватися на різних сторінках (DRY)
        my_seats = [{  # Список посад юзера
            'id': empSeat.id,
            'seat_id': empSeat.seat_id,
            'seat': empSeat.seat.seat if empSeat.is_main else '(в.о.) ' + empSeat.seat.seat,
        } for empSeat in Employee_Seat.objects.filter(employee_id=request.user.userprofile.id).filter(is_active=True)]

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
        for sub in subs_list:
            docs = [{  # Список документів у роботі, створених підлеглими юзера
                'id': temp_doc.document_id,
                'type': temp_doc.document.document_type.description,
                'type_id': temp_doc.document.document_type_id,
                'date': convert_to_localtime(temp_doc.timestamp),
                'author_seat_id': temp_doc.employee_seat_id,
                'author': temp_doc.employee_seat.employee.pip,
                'dep': temp_doc.employee_seat.seat.department.name,
                'closed': temp_doc.document.closed,
            } for temp_doc in Document_Path.objects.
                filter(mark_id=1).
                filter(employee_seat__seat_id=sub['id'])]
            if docs:
                for doc in docs:
                    sub_docs.append(doc)
        return HttpResponse(json.dumps(sub_docs))

    return HttpResponse(status=405)