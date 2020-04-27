from django.shortcuts import render
import json
from django.http import HttpResponse, HttpRequest
from django.shortcuts import render, get_object_or_404
from django.core.exceptions import ValidationError

from .models import Client, Product_type, Law, Law_file, Request, Answer_file
from .forms import NewClientForm, DelClientForm


def index(request):
    clients = [{
        'id': client.pk,
        'name': client.name
    } for client in
        Client.objects.only('id', 'name').filter(is_active=True)]

    return render(request, 'correspondence/index.html', {'clients': json.dumps(clients)})


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
