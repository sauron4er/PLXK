from django.utils.timezone import datetime, timedelta
from django.shortcuts import get_object_or_404
from plxk.api.try_except import try_except
from django.db.models import Q

from ..models import Vacation
from edms.api.move_to_new_employee import move_docs, move_approvals


@try_except
def get_vacations_list(request):
    vacations = Vacation.objects.filter(is_active=True)

    if 'all' not in request.POST:
        vacations = vacations # фільтруємо по юзеру

    if 'with_archive' not in request.POST or request.POST['with_archive'] == 'false':
        vacations = vacations.filter(finished=False)

    if not request.user.userprofile.is_it_admin and not request.user.userprofile.is_hr:
        vacations = vacations\
            .filter(Q(employee__id=request.user.userprofile.id) | Q(acting__id=request.user.userprofile.id))\
            .order_by('-begin')

    vacations = [{
        'id': vacation.id,
        'begin': vacation.begin.strftime('%Y-%m-%d'),
        'end': vacation.end.strftime('%Y-%m-%d'),
        'begin_table': vacation.begin.strftime('%d.%m.%Y'),
        'end_table': vacation.end.strftime('%d.%m.%Y'),
        'employee_id': vacation.employee.id,
        'employee_name': vacation.employee.pip,
        'acting_id': vacation.acting.id,
        'acting_name': vacation.acting.pip,
        'started': 'true' if vacation.started else '',
        'user_is_acting': 'true' if vacation.acting_id == request.user.userprofile.id else '',
        'finished': 'true' if vacation.finished else '',
    } for vacation in vacations]

    return vacations


def arrange_vacations():
    # TODO переробити на фільтрування по юзеру
    today = datetime.today()
    vacations = [{
        'id': vacation.id,
        'begin': vacation.begin,
        'end': vacation.end,
        'employee': vacation.employee_id,
        'acting': vacation.acting_id,
        'is_active': vacation.is_active,
        'started': vacation.started
    } for vacation in Vacation.objects
        .filter(is_active=True)
        .filter(begin__lte=today).filter(started=False) | Vacation.objects
        .filter(is_active=True)
        .filter(end__lt=today).filter(started=True)]

    for vacation in vacations:
        if vacation['begin'].strftime('%Y-%m-%d') <= today.strftime('%Y-%m-%d') and not vacation['started']:
            start_vacation(vacation)
        else:
            deactivate_vacation(vacation)


def add_or_change_vacation(request):
    try:
        vacation_instance = Vacation.objects.get(id=request.POST['id'])
    except Vacation.DoesNotExist:
        vacation_instance = Vacation()
    vacation_instance.begin = request.POST['begin']
    vacation_instance.end = request.POST['end']
    if request.POST['employee_id'] == '0':
        vacation_instance.employee_id = request.user.userprofile.id
    else:
        vacation_instance.employee_id = request.POST['employee_id']
    vacation_instance.acting_id = request.POST['acting_id']
    vacation_instance.save()
    # TODO запуск якщо відпустка вже почалася
    return 'ok'


def start_vacation(vacation):
    pass
    # vacation.update({'started': True})
    # vacation_instance = get_object_or_404(Vacation, pk=vacation['id'])
    # change_status_in_userprofile(vacation_instance.employee_id, vacation_instance.acting_id, True)
    # activate_acting_emp_seats(vacation_instance.employee_id, vacation_instance.acting_id)
    #
    # form = StartVacationForm(vacation, instance=vacation_instance)
    # if form.is_valid():
    #     form.save()


def deactivate_vacation(vacation):
    # TODO if started = реорганізувати документи, призначити finished
    vacation_instance = Vacation.objects.get(id=vacation)
    vacation_instance.is_active = False
    vacation_instance.save()
    return 'ok'


def change_status_in_userprofile(employee, acting, on_vacation):
    pass
    # form_data = {
    #     'acting': acting,
    #     'on_vacation': on_vacation
    # }
    # employee = get_object_or_404(accounts.UserProfile, pk=employee)
    # form = UserVacationForm(form_data, instance=employee)
    # if form.is_valid():
    #     form.save()


def activate_acting_emp_seats(employee_id, acting_id):
    pass
    # today = datetime.today()
    # emp_seats = [{
    #     'id': emp_seat.id,
    #     'seat_id': emp_seat.seat_id
    # } for emp_seat in Employee_Seat.objects.filter(employee_id=employee_id).filter(is_active=True)]
    # for emp_seat in emp_seats:
    #     vacation = {
    #         'employee': acting_id,
    #         'seat': emp_seat['seat_id'],
    #         'begin_date': today,
    #         'end_date': '',
    #         'is_active': True,
    #         'acting_for': emp_seat['id'],
    #         'is_main': False
    #     }
    #     form = ActingEmpSeatForm(vacation)
    #     if form.is_valid():
    #         acting_emp_seat = form.save()
    #         move_docs(emp_seat['id'], acting_emp_seat.pk)
    #         move_approvals(emp_seat['id'], acting_emp_seat.pk)


def deactivate_acting_emp_seats(employee_id, acting_id):
    pass
    # yesterday = datetime.today() - timedelta(days=1)
    # form_data = {
    #     'end_date': yesterday,
    #     'is_active': False
    # }
    #
    # emp_seats = Employee_Seat.objects.values_list('id', flat=True).filter(employee_id=employee_id).filter(is_active=True)
    # for emp_seat in emp_seats:
    #     acting_emp_seat = Employee_Seat.objects.values_list('id', flat=True)\
    #         .filter(employee_id=acting_id).filter(is_active=True).filter(acting_for=emp_seat)
    #     if acting_emp_seat:
    #         acting_emp_seat = acting_emp_seat[0]
    #         acting_emp_seat_instance = get_object_or_404(Employee_Seat, pk=acting_emp_seat)
    #         form = DeactivateEmpSeatForm(form_data, instance=acting_emp_seat_instance)
    #         if form.is_valid():
    #             form.save()
    #
    #         move_docs(acting_emp_seat, emp_seat)
    #         move_approvals(acting_emp_seat, emp_seat)

