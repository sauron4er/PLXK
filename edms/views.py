from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, get_object_or_404

from accounts import models as accounts  # import models Department, UserProfile
from .models import Seat, Employee_Seat
from .forms import DepartmentForm, SeatForm, UserProfileForm, EmployeeSeatForm


# Create your views here.


@login_required(login_url='login')
def edms_main(request):
    if request.method == 'GET':
        return render(request, 'edms/main.html')
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_my_docs(request):
    if request.method == 'GET':
        return render(request, 'edms/my_docs/my_docs.html')
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
            'emp_id': emp.pk,
            'emp': emp.pip,
            'on_vacation': 'true' if emp.on_vacation else 'false',
            'acting': 0 if emp.acting is None else emp.acting.pip,
            'acting_id': 0 if emp.acting is None else emp.acting.id,
        } for emp in accounts.UserProfile.objects.only(
            'id', 'pip', 'on_vacation', 'acting').filter(is_active=True).order_by('pip')]

        emps_seats = [{
            'id': empSeat.pk,
            'emp_seat': empSeat.seat.seat,
            'emp_seat_id': empSeat.seat.pk,
            'emp_id': empSeat.employee.pk,
        } for empSeat in
            Employee_Seat.objects.only('id', 'seat', 'employee').filter(is_active=True)]

        new_dep_form = DepartmentForm()  # django форма додачі нового відділу
        new_seat_form = SeatForm()  # django форма додачі нової посади

        # users_with_profile = (user.user.id for user in accounts.UserProfile.objects.only(
        #     'user__id').filter(user__is_active=True))  # список юзерів, для яких створено профіль
        # new_users = [{  # список юзерів, для яких не створено профіль
        #     'id': user.id,
        #     'name': user.last_name + ' ' + user.first_name,
        # } for user in accounts.User.objects.all().filter(
        #     is_active=True).exclude(id__in=users_with_profile).order_by('last_name')]

        return render(request, 'edms/hr/hr.html', {
            'deps': deps,
            'seats': seats,
            'emps': emps,
            'emps_seats': emps_seats,

            'new_dep_form': new_dep_form,
            'new_seat_form': new_seat_form,
            # 'new_users': new_users,
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

        if 'new_emp_seat' in request.POST:
            form_employee_seat = EmployeeSeatForm(request.POST)
            if form_employee_seat.is_valid():
                form_employee_seat.save()
                return redirect('hr.html')

    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_hr_emp(request, pk):       # changes in employee row
    post = get_object_or_404(accounts.UserProfile, pk=pk)
    if request.method == 'POST':
        form = UserProfileForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect('hr.html')
    elif request.method == 'GET':
        emp_seats = [{  # список зв’язків посада-співробітник
            'id': empSeat.pk,
            'seat': empSeat.seat.seat,
        } for empSeat in Employee_Seat.objects.only('id', 'seat').filter(employee_id=pk).filter(is_active=True).order_by('seat')]
        return HttpResponse(emp_seats)


@login_required(login_url='login')
def edms_hr_dep(request, pk):       # changes in department row
    post = get_object_or_404(accounts.Department, pk=pk)
    if request.method == 'POST':
        form = DepartmentForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect('hr.html')


@login_required(login_url='login')
def edms_hr_seat(request, pk):       # changes in seat row
    post = get_object_or_404(Seat, pk=pk)
    if request.method == 'POST':
        form = SeatForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect('hr.html')


@login_required(login_url='login')
def edms_hr_emp_seat(request, pk):       # changes in emp_seat row
    post = get_object_or_404(Employee_Seat, pk=pk)
    if request.method == 'POST':
        form = EmployeeSeatForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect('hr.html')
