from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login as auth_login
from django.http import HttpResponse
import json
from .forms import SignUpForm
from plxk.api.try_except import try_except
from django.contrib.auth.models import User
from .models import Department, UserProfile


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
    return render(request, 'accounts/departments.html', {'depatments': departments})


def department(request,pk):
    department = get_object_or_404(Department, pk=pk)
    employee = User.objects.filter(userprofile__department_id=pk).order_by('userprofile__pip')
    return render(request, 'accounts/department.html', {'depatment': department, 'employee': employee})


@try_except
def get_departments(request):
    departments = [{
        'id': dep.id,
        'name': dep.name
    } for dep in Department.objects.filter(is_active=True)]
    return HttpResponse(json.dumps(departments))


@login_required(login_url='login')
@try_except
def employees(request):
    employees = [{
            'id': up.id,
            'pip': up.pip,
            'tab_number': up.tab_number,
            'department': up.department_id or 0,
            'department_name': up.department.name if up.department else ''
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
