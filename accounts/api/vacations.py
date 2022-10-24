from django.utils.timezone import datetime
from plxk.api.try_except import try_except
from django.db.models import Q

from ..models import Vacation
from .vacations_mail_sender import send_acting_mail
from edms.api.vacations import activate_acting_emp_seats, deactivate_acting_emp_seats


@try_except
def get_vacations_list(request):
    vacations = Vacation.objects.filter(is_active=True).order_by('-begin')

    if 'show_all' not in request.POST or request.POST['show_all'] == 'false':
        vacations = vacations\
            .filter(Q(employee__id=request.user.userprofile.id) | Q(acting__id=request.user.userprofile.id))

    if 'with_archive' not in request.POST or request.POST['with_archive'] == 'false':
        vacations = vacations.filter(finished=False)

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


def add_or_change_vacation(request):
    try:
        vacation = Vacation.objects.get(id=request.POST['id'])
    except Vacation.DoesNotExist:
        vacation = Vacation()

    vacation.begin = request.POST['begin']
    vacation.end = request.POST['end']
    if request.POST['employee_id'] == '0':
        vacation.employee_id = request.user.userprofile.id
    else:
        vacation.employee_id = request.POST['employee_id']
    vacation.acting_id = request.POST['acting_id']
    vacation.save()

    today = datetime.today()
    if request.POST['id'] == '0':
        if datetime.strptime(vacation.begin, '%Y-%m-%d') <= today:
            start_vacation(vacation)
        else:
            send_acting_mail(vacation, 'planned')
    else:
        send_acting_mail(vacation, 'changed')

    return 'ok'


def deactivate_vacation(vacation):
    vacation = Vacation.objects.get(id=vacation)

    if vacation.started:
        end_vacation(vacation)
    else:
        vacation.is_active = False
        vacation.save()

    return 'ok'


def arrange_vacations_api():
    today = datetime.today()
    vacations_to_start = Vacation.objects\
        .filter(is_active=True)\
        .filter(begin__lte=today).filter(started=False)

    vacation_to_finish = Vacation.objects\
        .filter(is_active=True)\
        .filter(end__lt=today).filter(finished=False)

    for vacation in vacations_to_start:
        start_vacation(vacation)

    for vacation in vacation_to_finish:
        end_vacation(vacation)

    return 'ok'


def start_vacation(vacation):
    vacation.started = True
    vacation.save()
    change_status_in_userprofile(vacation.employee, vacation.acting, True)
    activate_acting_emp_seats(vacation)

    send_acting_mail(vacation, 'begin')


def end_vacation(vacation):
    vacation.finished = True
    vacation.save()

    change_status_in_userprofile(vacation.employee, None, False)
    deactivate_acting_emp_seats(vacation)

    send_acting_mail(vacation, 'end')


def change_status_in_userprofile(employee, acting, on_vacation):
    employee.acting = acting
    employee.on_vacation = on_vacation
    employee.save()
