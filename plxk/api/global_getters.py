from django.contrib.auth.models import User
from accounts.models import Department
from edms.models import Employee_Seat
from plxk.api.try_except import try_except


@try_except
def get_employees_list():
    return [{
        'id': emp.pk,
        'name': emp.last_name + ' ' + emp.first_name,
        'mail': emp.email
    } for emp in
        User.objects.only('id', 'last_name', 'first_name')
            .exclude(id=10)  # Викидуємо зі списка користувача Охорона
            .filter(is_active=True)
            .order_by('last_name')]


@try_except
def get_emp_seats_list():
    return [{
        'id': emp_seat.pk,
        'emp_seat': emp_seat.employee.pip + ', ' + emp_seat.seat.seat,
        'emp_id': emp_seat.employee.id,
        'seat_id': emp_seat.seat.id,
        'is_dep_chief': emp_seat.seat.is_dep_chief,
    } for emp_seat in
        Employee_Seat.objects.filter(is_active=True).order_by('employee__pip')]


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