from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect

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
        # documents = Document.object.all()
        # return render(request, 'edms/main.html', {'documents': documents})
        # return HttpResponse('edms')

        # deps = serializers.serialize('json', accounts.Department.objects.all(), fields=('name', 'manager_id', 'text'))
        deps = [{
            'id': dep.pk,
            'dep': dep.name,
            'text': dep.text,
            'chief': 'Не внесено' if dep.manager is None else dep.manager.last_name + ' ' + dep.manager.first_name,
        } for dep in accounts.Department.objects.only('name', 'manager_id')]

        seats = [{
            'id': seat.pk,
            'department': seat.department.name,
            'seat': seat.seat,
            'chief': 'Не внесено' if seat.chief is None else seat.chief.seat
        } for seat in Seat.objects.all()]

        emps = [{
            'id': emp.pk,
            'emp': emp.user.last_name + ' ' + emp.user.first_name,
            'department': emp.department.name,
            'username': emp.user.username,
        } for emp in accounts.UserProfile.objects.only('user', 'department_id')]

        new_dep_form = DepartmentForm()

        return render(request, 'edms/hr/hr.html', {
            'deps': deps,
            'seats': seats,
            'emps': emps,
            'new_dep_form': new_dep_form,
        })

    else:  # POST method
        if 'new_dep' in request.POST:
            form = DepartmentForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('hr.html')

    return HttpResponse(status=405)
