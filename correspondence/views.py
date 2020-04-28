from django.shortcuts import render
import json
from django.http import HttpResponse, HttpRequest
from django.shortcuts import render, get_object_or_404
from django.core.exceptions import ValidationError

from .models import Client, Product_type, Law, Law_file, Request, Answer_file
from .forms import NewClientForm, DelClientForm, NewLawForm, DelLawForm


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
    } for law in
        Law.objects.only('id', 'name', 'url').filter(is_active=True)]

    for law in laws:
        files = [{
            'id': file.pk,
            'name': file.name,
            'file': file.file.name,
        } for file in
            Law_file.objects.only('id', 'name', 'file').filter(law_id=law['id']).filter(is_active=True)]

        law.update({'files': files})

    return render(request, 'correspondence/index.html', {'clients': json.dumps(clients),
                                                         'laws': json.dumps(laws)},)


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
