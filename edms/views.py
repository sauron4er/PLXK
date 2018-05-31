from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, get_object_or_404

from accounts import models as accounts  # import models Department, UserProfile
from .models import Seat
from .forms import DepartmentForm, SeatForm, UserForm, UserProfileForm, EmployeeSeatForm


# Create your views here.


@login_required(login_url='login')
def edms_main(request):
    if request.method == 'GET':
        # documents = Document.object.all()
        # return render(request, 'edms/main.html', {'documents': documents})

        # return HttpResponse('edms')
        return render(request, 'edms/main.html')
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_hr(request):
    if request.method == 'GET':

        deps = [{       # Список відділів для форм на сторінці відділу кадрів
            'id': dep.pk,
            'dep': dep.name,
            'text': dep.text,
            'chief': 'Не внесено' if dep.manager is None else dep.manager.last_name + ' ' + dep.manager.first_name,
            'chief_id': 0 if dep.manager is None else dep.manager.id,
        } for dep in accounts.Department.objects.filter(is_active=True).order_by('name')]

        seats = [{       # Список посад для форм на сторінці відділу кадрів
            'id': seat.pk,
            'seat': seat.seat,
            'dep': 'Не внесено' if seat.department is None else seat.department.name,
            'dep_id': 0 if seat.department is None else seat.department.id,
            'chief': 'Не внесено' if seat.chief is None else seat.chief.seat,
            'chief_id': 0 if seat.chief is None else seat.chief.id,
        } for seat in Seat.objects.all().filter(is_active=True).order_by('seat')]

        emps = [{       # Список працівників для форм на сторінці відділу кадрів
            'id': emp.user.pk,
            'emp': emp.pip,
        } for emp in accounts.UserProfile.objects.only('pip').filter(user__is_active=True).order_by('pip')]

        new_dep_form = DepartmentForm()  # django форма додачі нового відділу
        new_seat_form = SeatForm()  # django форма додачі нової посади

        users_with_profile = (user.user.id for user in accounts.UserProfile.objects.only(
            'user__id').filter(user__is_active=True))  # список юзерів, для яких створено профіль
        new_users = [{  # список юзерів, для яких не створено профіль
            'id': user.id,
            'name': user.last_name + ' ' + user.first_name,
        } for user in accounts.User.objects.all().filter(
            is_active=True).exclude(id__in=users_with_profile).order_by('last_name')]

        return render(request, 'edms/hr/hr.html', {
            'deps': deps,
            'seats': seats,
            'emps': emps,
            'new_dep_form': new_dep_form,
            'new_seat_form': new_seat_form,
            'new_users': new_users,
        })

    elif request.method == 'POST':

        if 'new_dep' in request.POST:
            form = DepartmentForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('hr.html')

        if 'new_seat' in request.POST:
            form = SeatForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('hr.html')

        if 'new_user' in request.POST:
            form_user_profile = UserProfileForm(request.POST)
            form_employee_seat = EmployeeSeatForm(request.POST)

            if form_user_profile.is_valid() and form_employee_seat.is_valid():
                form_user_profile.save()
                form_employee_seat.save()
                return redirect('hr.html')
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_hr_dep(request, pk):       # changes in department
    post = get_object_or_404(accounts.Department, pk=pk)
    if request.method == 'POST':
        form = DepartmentForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect('hr.html')


@login_required(login_url='login')
def edms_hr_seat(request, pk):       # changes in seat
    post = get_object_or_404(Seat, pk=pk)
    if request.method == 'POST':
        form = SeatForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect('hr.html')


