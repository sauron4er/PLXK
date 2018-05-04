from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.core import serializers

from accounts import models as accounts  # import models Department, UserProfile


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

        # dep = accounts.Department.objects.defer('name', 'manager_id', 'text')
        deps = serializers.serialize('json', accounts.Department.objects.all(), fields=('name', 'manager_id', 'text'))
        return render(request, 'edms/hr.html', {'departments': deps})

    return HttpResponse(status=405)
