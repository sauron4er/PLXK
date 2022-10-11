from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login as auth_login
from django.http import HttpResponse
import json
from .forms import SignUpForm
from edms.api.getters import get_dep_chief
from plxk.api.try_except import try_except
from django.contrib.auth.models import User
from .models import Department, UserProfile
from plxk.api.global_getters import get_simple_emp_seats_list
from .api.vacations import get_vacations_list, add_or_change_vacation, deactivate_vacation


def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user)
            return redirect('forum')
    else:
        form = SignUpForm()
    return render(request, 'accounts/signup.html', {'form': form})


def departments(request):
    departments = Department.objects.all()
    return render(request, 'accounts/departments.html', {'departments': departments})


def department(request, pk):
    department = get_object_or_404(Department, pk=pk)
    employee = User.objects.filter(userprofile__department_id=pk).order_by('userprofile__pip')
    return render(request, 'accounts/department.html', {'depatment': department, 'employee': employee})


@login_required(login_url='login')
@try_except
def get_departments(request, company='TDV'):
    departments = Department.objects.only('id', 'name')\
        .filter(is_active=True)\
        .order_by('name')

    if company == 'TDV':
        departments = departments.filter(is_tdv=True)
    if company == 'TOV':
        departments = departments.exclude(is_tdv=True)

    departments = [{
        'id': department.pk,
        'name': department.name,
    } for department in departments]

    return HttpResponse(json.dumps(departments))


@login_required(login_url='login')
@try_except
def get_dep_chief_seat(request, dep_id):
    dep_chief = get_dep_chief(dep_id)
    if dep_chief:
        return HttpResponse(json.dumps(dep_chief))
    return HttpResponse(json.dumps({'id': -1, 'name': 'У системі не зазначено начальника відділу'}))


@login_required(login_url='login')
@try_except
def employees(request):
    employees = [{
            'id': up.id,
            'pip': up.pip,
            'tab_number': up.tab_number,
            'department': up.department_id or 0,
            'department_name': up.department.name if up.department else '',
            'is_pc_user': 'true' if up.is_pc_user else 'false'
        } for up in UserProfile.objects.filter(is_active=True).order_by('pip')]
    return render(request, 'accounts/employees/employees.html', {'employees': employees})


@login_required(login_url='login')
@try_except
def save_employee(request):
    from django.db import IntegrityError
    if request.POST['id'] == '0':
        try:
            new_employee = UserProfile(pip=request.POST['pip'],
                                       department_id=request.POST['department'],
                                       tab_number=request.POST['tab_number'],
                                       is_pc_user=False)
            new_employee.save()
        except IntegrityError as e:
            if 'Duplicate entry' in e.args[1]:  # or e.args[0] from Django 1.10
                return HttpResponse('Такий табельний номер вже зареєстровано')
    else:
        employee = get_object_or_404(UserProfile, pk=request.POST['id'])
        employee.pip = request.POST['pip']
        employee.department_id = request.POST['department']
        employee.tab_number = request.POST['tab_number']
        employee.save()
    return HttpResponse('ok')


@login_required(login_url='login')
@try_except
def deact_employee(request, pk):
    employee = get_object_or_404(UserProfile, pk=pk)
    employee.is_active = False
    employee.save()
    return HttpResponse('ok')


#  --------------------------------------------------- Vacations
@login_required(login_url='login')
@try_except
def vacations(request):
    vacations_list = get_vacations_list(request)
    employees_list = get_simple_emp_seats_list()
    return render(request, 'accounts/vacations/index.html', {'vacations': vacations_list, 'employees': employees_list})


@try_except
def get_vacations(request):
    # TODO фільтрування по юзеру або показ всіх
    return HttpResponse(json.dumps(get_vacations_list(request)))


@try_except
def edit_vacation(request):
    return HttpResponse(add_or_change_vacation(request.POST))


@try_except
def del_vacation(request):
    deactivate_vacation(request.POST['id'])
    return HttpResponse('ok')
