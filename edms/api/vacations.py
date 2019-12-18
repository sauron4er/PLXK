import schedule
import time
from django.utils.timezone import datetime
from django.shortcuts import get_object_or_404

from accounts import models as accounts
from ..models import Vacation, Employee_Seat, Mark_Demand
from ..forms import VacationForm, DeactivateVacationForm, UserVacationForm, StartVacationForm,\
    ActingEmpSeatForm, DeactivateEmpSeatForm, MarkDemandChangeRecipientForm


def schedule_vacations_arrange():
    schedule.every().day.at("00:01").do(arrange_vacations)
    while True:
        schedule.run_pending()
        time.sleep(3600)


def arrange_vacations():
    print('00:01')
    today = datetime.today()
    vacations = [{
        'id': vacation.id,
        'begin': vacation.begin,
        'end': vacation.end,
        'employee': vacation.employee_id,
        'acting': vacation.acting_id
    } for vacation in Vacation.objects
        .filter(is_active=True)
        .filter(begin=today).filter(started=False) | Vacation.objects
        .filter(is_active=True)
        .filter(end=today).filter(started=True)]

    for vacation in vacations:
        if vacation['begin'].strftime('%Y-%m-%d') == today.strftime('%Y-%m-%d'):
            start_vacation(vacation)
        else:
            end_vacation(vacation['employee'], vacation['acting'])


def add_vacation(request):
    doc_request = request.POST.copy()
    form = VacationForm(doc_request)
    if form.is_valid():
        try:
            new_vacation = form.save()
            doc_request.update({'id': new_vacation.pk})
            if doc_request['begin'] <= datetime.today().strftime('%Y-%m-%d'):
                start_vacation(doc_request)
            return new_vacation.pk
        except Exception as err:
            raise err


def start_vacation(vacation):
    change_status_in_userprofile(vacation['employee'], vacation['acting'], True)
    activate_acting_emp_seats(vacation['employee'], vacation['acting'])

    vacation.update({'started': True})
    vacation_instance = get_object_or_404(Vacation, pk=vacation['id'])
    form = StartVacationForm(vacation, instance=vacation_instance)
    if form.is_valid():
        form.save()


def change_status_in_userprofile(employee, acting, on_vacation):
    print('!')
    form_data = {
        'acting': acting,
        'on_vacation': on_vacation
    }
    employee = get_object_or_404(accounts.UserProfile, pk=employee)
    form = UserVacationForm(form_data, instance=employee)
    if form.is_valid():
        form.save()


def activate_acting_emp_seats(employee_id, acting_id):
    today = datetime.today()
    emp_seats = [{
        'id': emp_seat.id,
        'seat_id': emp_seat.seat_id
    } for emp_seat in Employee_Seat.objects.filter(employee_id=employee_id).filter(is_active=True)]
    for emp_seat in emp_seats:
        vacation = {
            'employee': acting_id,
            'seat': emp_seat['seat_id'],
            'begin_date': today,
            'end_date': '',
            'is_active': True,
            'acting_for': emp_seat['id'],
            'is_main': False
        }
        form = ActingEmpSeatForm(vacation)
        if form.is_valid():
            acting_emp_seat = form.save()
            move_docs(emp_seat['id'], acting_emp_seat.pk)


def deactivate_acting_emp_seats(employee_id, acting_id):
    today = datetime.today()
    form_data = {
        'end_date': today,
        'is_active': False
    }

    emp_seats = Employee_Seat.objects.values_list('id', flat=True).filter(employee_id=employee_id).filter(is_active=True)
    for emp_seat in emp_seats:
        acting_emp_seat = Employee_Seat.objects.values_list('id', flat=True)\
            .filter(employee_id=acting_id).filter(is_active=True).filter(acting_for=emp_seat)
        if acting_emp_seat:
            acting_emp_seat = acting_emp_seat[0]
            acting_emp_seat_instance = get_object_or_404(Employee_Seat, pk=acting_emp_seat)
            form = DeactivateEmpSeatForm(form_data, instance=acting_emp_seat_instance)
            if form.is_valid():
                form.save()

            move_docs(acting_emp_seat, emp_seat)


def end_vacation(employee, acting):
    change_status_in_userprofile(employee, None, False)
    deactivate_acting_emp_seats(employee, acting)


def deactivate_vacation(request):
    doc_request = request.POST.copy()
    doc_request.update({
        'is_active': False
    })
    vacation = get_object_or_404(Vacation, pk=doc_request['id'])
    form = DeactivateVacationForm(request, instance=vacation)
    if form.is_valid:
        form.save()

    if vacation.started:
        end_vacation(vacation.employee_id, vacation.acting_id)


def move_docs(move_from, move_to):
    mark_demands = Mark_Demand.objects.values_list('id', flat=True).filter(recipient_id=move_from).filter(is_active=True)
    for mark_demand in mark_demands:
        mark_demand_instance = get_object_or_404(Mark_Demand, pk=mark_demand)
        form_data = {'recipient': move_to}
        form = MarkDemandChangeRecipientForm(form_data, instance=mark_demand_instance)
        if form.is_valid:
            form.save()


# Функція, яка отримує ід людинопосади, перевіряє чи вона у відпустці і повертає її id або id в.о.
def vacation_check(emp_seat_id):
    # Перевіряємо, чи людина у відпустці:
    emp_on_vacation = Employee_Seat.objects.values_list('employee__on_vacation', flat=True) \
        .filter(id=emp_seat_id)[0]

    if emp_on_vacation is True:
        # Активна людино-посада в.о.:
        acting_emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
            .filter(acting_for_id=emp_seat_id).filter(is_active=True)[0]
        return acting_emp_seat_id
    else:
        return emp_seat_id