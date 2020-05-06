from django.shortcuts import render
import json
from django.http import HttpResponse, HttpRequest
from django.shortcuts import render, get_object_or_404
from django.core.exceptions import ValidationError

from .models import Client, Product_type, Law, Law_file, Request, Answer_file
from .forms import NewClientForm, DelClientForm, NewLawForm, DelLawForm
from accounts.models import UserProfile


def index(request):
    clients = [{
        'id': client.pk,
        'name': client.name
    } for client in
        Client.objects.only('id', 'name').filter(is_active=True)]

    laws = [{
        'id': law.pk,
        'name': law.name,
        'url': law.url,
        'files': [{
            'id': file.pk,
            'name': file.name,
            'file': file.file.name,
        } for file in
            Law_file.objects.only('id', 'name', 'file').filter(law_id=law.id).filter(is_active=True)]
    } for law in Law.objects.only('id', 'name', 'url').filter(is_active=True)]

    employees = [{
        'id': user.pk,
        'name': user.pip,
    } for user in UserProfile.objects.only('id', 'pip')
        .filter(is_active=True)
        .filter(is_correspondence_view=True)
        # .filter(is_it_admin=False)
    ]

    requests = [{
        'id': request.pk,
        'product': request.product_type_id,
        'client_name': request.client_name,
        'request_date': request.request_date,
        'request_term': request.request_term,
        'request_responsible': request.responsible.last_name + ' ' + request.responsible.first_name,
    } for request in Request.objects.all().filter(is_active=True)]

    return render(request, 'correspondence/index.html', {'clients': json.dumps(clients),
                                                         'laws': json.dumps(laws),
                                                         'requests': json.dumps(requests),
                                                         'employees': json.dumps(employees)})


#  --------------------------------------------------- Clients
def new_client(request):
    try:
        client_form = NewClientForm(request.POST)
        if client_form.is_valid():
            client = client_form.save()
            return HttpResponse(client.pk)
        else:
            raise ValidationError('form invalid')
    except Exception as err:
        raise err


def del_client(request):
    try:
        client = get_object_or_404(Client, pk=request.POST['id'])
        client_form = DelClientForm(request.POST, instance=client)
        if client_form.is_valid():
            client = client_form.save()
            return HttpResponse(client.pk)
        else:
            raise ValidationError('form invalid')
    except Exception as err:
        raise err


#  --------------------------------------------------- Laws
def post_law(post_request):
    try:
        law_form = NewLawForm(post_request)
        if law_form.is_valid():
            law = law_form.save()
            return law
        else:
            raise ValidationError('form invalid')
    except Exception as err:
        raise err


def post_law_files(files, post_request):
    law = get_object_or_404(Law, pk=post_request['id'])

    for file in files.getlist('files'):
        Law_file.objects.create(
            law=law,
            file=file,
            name=file.name
        )


def new_law(request):
    post_request = request.POST.copy()
    law = post_law(post_request)
    post_request.update({'law': law.pk, 'id': law.pk})
    post_law_files(request.FILES, post_request)

    return HttpResponse(law.pk)


def del_law(request):
    try:
        law = get_object_or_404(Law, pk=request.POST['id'])
        law_form = DelLawForm(request.POST, instance=law)
        if law_form.is_valid():
            law = law_form.save()
            return HttpResponse(law.pk)
        else:
            raise ValidationError('form invalid')
    except Exception as err:
        raise err


#  --------------------------------------------------- Requests
def new_request(request):
    try:
        asd = json.loads(request.POST)
        test=1
    except Exception as err:
        raise err


def edit_request(request):
    try:
        asd = json.loads(request.POST['request'])
        test=1
    except Exception as err:
        raise err


def del_request(request):
    try:
        test=1
    except Exception as err:
        raise err
