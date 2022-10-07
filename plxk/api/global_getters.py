from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from accounts.models import Department, UserProfile
from edms.models import Employee_Seat, Seat
from plxk.api.try_except import try_except
from edms.api.vacations import vacation_check
from edms.api.getters import get_my_seats, get_sub_emps


@try_except
def get_userprofiles_list():
    return [{
        'id': emp.pk,
        'name': emp.pip
    } for emp in
        UserProfile.objects
            .exclude(id=11)  # Викидуємо зі списка користувача Охорона
            .filter(is_active=True)
            .order_by('pip')]


@try_except
def get_users_list():
    return [{
        'id': emp.pk,
        'name': emp.last_name + ' ' + emp.first_name,
        'mail': emp.email
    } for emp in
        User.objects.only('id', 'last_name', 'first_name')
            .exclude(userprofile__delete_from_noms=True)
            .filter(is_active=True).filter(userprofile__is_active=True)
            .order_by('last_name')]


@try_except
def get_emp_seats_list(request=''):
    return [{
        'id': emp_seat.pk,
        'emp_seat': emp_seat.employee.pip + ', ' + emp_seat.seat.seat,
        'name': emp_seat.employee.pip + ', ' + emp_seat.seat.seat,
        'emp_id': emp_seat.employee.id,
        'seat_id': emp_seat.seat.id,
        'is_dep_chief': emp_seat.seat.is_dep_chief,
    } for emp_seat in
        Employee_Seat.objects
            .filter(is_active=True)
            .exclude(employee__delete_from_noms=True)
            .order_by('employee__pip')]


@try_except
def get_simple_emp_seats_list(request=''):
    return [{
        'id': emp_seat.pk,
        'emp_seat': emp_seat.employee.pip + ', ' + emp_seat.seat.seat,
        'name': emp_seat.employee.pip + ', ' + emp_seat.seat.seat,
    } for emp_seat in
        Employee_Seat.objects
            .filter(is_active=True)
            .exclude(employee__delete_from_noms=True)
            .order_by('employee__pip')]


# Функція, яка повертає список всіх актуальних посад та керівників щодо цих посад юзера
@try_except
def get_users_emp_seat_ids(employee_id):
    return list(Employee_Seat.objects.values_list('id', flat=True).filter(employee_id=employee_id).filter(is_active=True))


@try_except
def get_departments_list():
    return [{
        'id': dep.pk,
        'name': dep.name
    } for dep in
        Department.objects.only('id', 'name')
            .filter(is_active=True)
            .order_by('name')]


@try_except
def is_it_lawyer(id):
    emp_seats = list(Employee_Seat.objects.values_list('seat__department_id', flat=True).filter(employee_id=id).filter(is_active=True))
    for emp_seat in emp_seats:
        if emp_seat == 50:  # 50 - id юридичного відділу
            return True
    return False


@try_except
def get_user_mail(id):
    mail = User.objects.values_list('email', flat=True).filter(id=id)
    return mail[0] if mail else ''


@try_except
def get_deps():
    deps = [{
        'id': dep.pk,
        'dep': dep.name,
        'text': dep.text,
    } for dep in Department.objects.filter(is_active=True).order_by('name')]
    return deps


@try_except
def get_dep_chief(userprofile, return_type='userprofile'):
    department_chief_seat = Seat.objects.values_list('id', flat=True) \
        .filter(department=userprofile.department) \
        .filter(is_dep_chief=True)
    if not department_chief_seat:
        # return 'у підрозділа нема призначеної керівної посади'
        return 0

    dep_chief = Employee_Seat.objects.values_list('id', flat=True) \
        .filter(seat_id=department_chief_seat[0]) \
        .filter(is_main=True) \
        .filter(is_active=True)

    if not dep_chief:
        # return 'у підрозділа нема призначеного керівника'
        return 0

    dep_chief_acting = vacation_check(dep_chief[0])

    dep_chief_acting = get_object_or_404(Employee_Seat, pk=dep_chief_acting)

    if return_type == 'userprofile':
        return dep_chief_acting.employee.user.userprofile
    elif return_type == 'id':
        return dep_chief_acting.employee.user.userprofile.id
    else:
        return dep_chief_acting.employee.user


@try_except
def get_director_userprofile(return_type=''):
    director = Employee_Seat.objects.values_list('id', flat=True).filter(seat=16).filter(is_active=True)[0]
    active_director = vacation_check(director)
    if return_type == 'id':
        id = Employee_Seat.objects.values_list('employee__id', flat=True).filter(id=active_director)[0]
        return id
    else:
        name = Employee_Seat.objects.values_list('employee__pip', flat=True).filter(id=active_director)[0]
        seat = Employee_Seat.objects.values_list('seat__seat', flat=True).filter(id=active_director)[0]
        name_seat = name + ', ' + seat
        return name_seat


@try_except
def get_quality_director(return_type=''):
    qd = Employee_Seat.objects.values_list('id', flat=True).filter(seat=42).filter(is_active=True)[0]
    active_qd = vacation_check(qd)
    if return_type == 'name':
        name = Employee_Seat.objects.values_list('employee__pip', flat=True).filter(id=active_qd)[0]
        return name
    return ''


@try_except
def is_this_my_sub(user, sub):
    sub_seats = get_my_seats(sub.userprofile.id, False)

    for sub in sub_seats:
        if sub['chief_emp_id'] == user.userprofile.id:
            return True
    return False
