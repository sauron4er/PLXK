from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

from accounts import models as accounts  # import models Department, UserProfile
from .models import Seat


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
            'manager': 'Не внесено' if dep.manager is None else dep.manager.last_name + ' ' + dep.manager.first_name,
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
        } for emp in accounts.UserProfile.objects.only('user', 'department_id')]

        # paginator = Paginator(seats, 16)
        # page = request.GET.get('page')
        # try:
        #     seats = paginator.page(page)
        # except PageNotAnInteger:
        #     seats = paginator.page(1)
        # except EmptyPage:
        #     seats

        # users = serializers.serialize('json', edms.EmployeePosition.objects.all())
        return render(request, 'edms/hr/hr.html', {'deps': deps, 'seats': seats, 'emps': emps})

    return HttpResponse(status=405)
