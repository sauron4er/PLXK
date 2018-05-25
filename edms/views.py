from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, get_object_or_404

from accounts import models as accounts  # import models Department, UserProfile
from .models import Seat
from .forms import DepartmentForm


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

        deps = [{
            'id': dep.pk,
            'dep': dep.name,
            'text': dep.text,
            'chief': 'Не внесено' if dep.manager is None else dep.manager.last_name + ' ' + dep.manager.first_name,
            'chief_id': 0 if dep.manager is None else dep.manager.id,
        } for dep in accounts.Department.objects.only('name', 'manager_id').order_by('name')]

        seats = [{
            'id': seat.pk,
            'department': seat.department.name,
            'seat': seat.seat,
            'chief': 'Не внесено' if seat.chief is None else seat.chief.seat
        } for seat in Seat.objects.all().order_by('seat')]

        emps = [{
            'id': emp.user.pk,
            'emp': emp.user.last_name + ' ' + emp.user.first_name,
            'dep': emp.department.name,
            'dep_id': emp.department.id,
            'username': emp.user.username,
        } for emp in accounts.UserProfile.objects.only('user', 'department_id').order_by('user__last_name')]

        new_dep_form = DepartmentForm()

        return render(request, 'edms/hr/hr.html', {
            'deps': deps,
            'seats': seats,
            'emps': emps,
            'new_dep_form': new_dep_form,
        })

    elif request.method == 'POST':

        if 'new_dep' in request.POST:
            form = DepartmentForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('hr.html')
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_hr_dep(request, pk):
    post = get_object_or_404(accounts.Department, pk=pk)
    if request.method == 'POST':
        # dep = accounts.Department.objects.create(
        #     name=request.POST['name'],
        #     text=request.POST['text'],
        #     manager=request.POST['manager'],
        # )
        form = DepartmentForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect('hr.html')
    # elif request.method == 'GET':
    #     return render(request, 'edms/main.html')
