from django.utils.timezone import datetime, timedelta
from django.shortcuts import get_object_or_404

from accounts import models as accounts
from ..models import Vacation, Employee_Seat
from ..forms import VacationForm, DeactivateVacationForm, UserVacationForm, StartVacationForm,\
    ActingEmpSeatForm, DeactivateEmpSeatForm
from edms.api.move_to_new_employee import move_docs, move_approvals


def arrange_vacations():
    pass
    # DEPRECATED
    # today = datetime.today()
    # vacations = [{
    #     'id': vacation.id,
    #     'begin': vacation.begin,
    #     'end': vacation.end,
    #     'employee': vacation.employee_id,
    #     'acting': vacation.acting_id,
    #     'is_active': vacation.is_active,
    #     'started': vacation.started
    # } for vacation in Vacation.objects
    #     .filter(is_active=True)
    #     .filter(begin__lte=today).filter(started=False) | Vacation.objects
    #     .filter(is_active=True)
    #     .filter(end__lt=today).filter(started=True)]
    #
    # for vacation in vacations:
    #     if vacation['begin'].strftime('%Y-%m-%d') <= today.strftime('%Y-%m-%d') and not vacation['started']:
    #         start_vacation(vacation)
    #     else:
    #         deactivate_vacation(vacation)


def add_vacation(request):
    pass
    # DEPRECATED
    # doc_request = request.POST.copy()
    # form = VacationForm(doc_request)
    # if form.is_valid():
    #     try:
    #         new_vacation = form.save()
    #         doc_request.update({'id': new_vacation.pk})
    #         if doc_request['begin'] <= datetime.today().strftime('%Y-%m-%d'):
    #             start_vacation(doc_request)
    #         return new_vacation.pk
    #     except Exception as err:
    #         raise err


def start_vacation(vacation):
    pass
    # DEPRECATED
    # vacation.update({'started': True})
    # vacation_instance = get_object_or_404(Vacation, pk=vacation['id'])
    # change_status_in_userprofile(vacation_instance.employee_id, vacation_instance.acting_id, True)
    # activate_acting_emp_seats(vacation_instance.employee_id, vacation_instance.acting_id)
    #
    # form = StartVacationForm(vacation, instance=vacation_instance)
    # if form.is_valid():
    #     form.save()


def deactivate_vacation(vacation):
    pass
    # DEPRECATED
    # vacation.update({'is_active': False})
    # vacation_instance = get_object_or_404(Vacation, pk=vacation['id'])
    #
    # if vacation_instance.is_active:
    #     change_status_in_userprofile(vacation_instance.employee_id, None, False)
    #     deactivate_acting_emp_seats(vacation_instance.employee_id, vacation_instance.acting_id)
    #
    # form = DeactivateVacationForm(vacation, instance=vacation_instance)
    # if form.is_valid:
    #     form.save()


def change_status_in_userprofile(employee, acting, on_vacation):
    pass
    # DEPRECATED
    # form_data = {
    #     'acting': acting,
    #     'on_vacation': on_vacation
    # }
    # employee = get_object_or_404(accounts.UserProfile, pk=employee)
    # form = UserVacationForm(form_data, instance=employee)
    # if form.is_valid():
    #     form.save()


def activate_acting_emp_seats(vacation):
    # Знаходимо активні посади людини, що йде у відпустку
    employee_emp_seats = Employee_Seat.objects.filter(employee=vacation.employee).filter(is_active=True)

    for emp_seat in employee_emp_seats:
        # Для кожної посади знаходимо існуючу людино-посаду в.о. і змінюємо дату початку відпустки, або створюємо нову
        try:
            acting_emp_seat = Employee_Seat.objects.get(employee=vacation.acting, acting_for=emp_seat, seat=emp_seat.seat)
        except Employee_Seat.DoesNotExist:
            acting_emp_seat = Employee_Seat(employee=vacation.acting, acting_for=emp_seat, seat=emp_seat.seat)

        acting_emp_seat.begin_date = vacation.begin
        acting_emp_seat.is_active = True
        acting_emp_seat.is_main = False
        acting_emp_seat.save()

        move_docs(emp_seat.pk, acting_emp_seat.pk)
        move_approvals(emp_seat.pk, acting_emp_seat.pk)


def deactivate_acting_emp_seats(vacation):
    # Знаходимо активні посади людини, що повертається з відпустки
    employee_emp_seats = Employee_Seat.objects.filter(employee=vacation.employee).filter(is_active=True)

    for emp_seat in employee_emp_seats:
        # Для кожної посади знаходимо людинопосаду в.о. і деактивуємо,
        acting_emp_seat = Employee_Seat.objects.get(employee=vacation.acting, acting_for=emp_seat)

        acting_emp_seat.end_date = vacation.end
        acting_emp_seat.is_active = False
        acting_emp_seat.save()

        move_docs(acting_emp_seat.id, emp_seat.id)
        move_approvals(acting_emp_seat.id, emp_seat.id)


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