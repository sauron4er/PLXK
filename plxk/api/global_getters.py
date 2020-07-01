from django.contrib.auth.models import User
from accounts.models import Department


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


def get_departments_list():
    return [{
        'id': dep.pk,
        'name': dep.name
    } for dep in
        Department.objects.only('id', 'name')
            .filter(is_active=True)
            .order_by('name')]
