from django.contrib.auth import login as auth_login
from django.contrib.auth.models import User
from django.shortcuts import render, redirect, get_object_or_404
from .models import Department
from edms.models import Seat
from django.http import HttpResponse
import json
from .forms import SignUpForm


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


def get_dep_chief_seat(request, dep_id):
    dep_chief = Seat.objects\
        .filter(department_id=dep_id)\
        .filter(is_dep_chief=True)\
        .filter(is_active=True)
    if dep_chief:
        return HttpResponse(dep_chief[0])
    return HttpResponse('У системі не зазначено начальника відділу')
