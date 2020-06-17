import json
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from correspondence.forms import NewClientForm, DelClientForm
from production.forms import NewMockupTypeForm, DelMockupTypeForm, NewMockupProductTypeForm, DelMockupProductTypeForm
from production.api.getters import *


@try_except
def get_clients(request, product_type):
    return HttpResponse(json.dumps(get_clients_list(product_type)))


@try_except
def get_mockup_types(request):
    return HttpResponse(json.dumps(get_mockup_types_list()))


@try_except
def get_mockup_product_types(request):
    return HttpResponse(json.dumps(get_mockup_product_types_list()))


@login_required(login_url='login')
@try_except
def clients(request):
    clients_list = get_clients_list()
    product_types = get_product_types()
    return render(request, 'production/clients.html', {'clients': clients_list, 'product_types': product_types})


@try_except
def new_client(request):
    form = NewClientForm(request.POST)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect('clients.html')


@try_except
def del_client(request):
    client = get_object_or_404(Client, pk=request.POST.get('id'))
    form = DelClientForm(request.POST, instance=client)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect('clients.html')


@login_required(login_url='login')
@try_except
def mockup_types(request):
    mockup_types_list = get_mockup_types_list()
    return render(request, 'production/mockup_types.html', {'mockup_types': mockup_types_list})


@login_required(login_url='login')
@try_except
def new_mockup_type(request):
    form = NewMockupTypeForm(request.POST)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect('mockup_types.html')


@login_required(login_url='login')
@try_except
def del_mockup_type(request):
    mockup_type = get_object_or_404(Mockup_type, pk=request.POST.get('id'))
    form = DelMockupTypeForm(request.POST, instance=mockup_type)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect('mockup_types.html')


@login_required(login_url='login')
@try_except
def mockup_product_types(request):
    mockup_product_types_list = get_mockup_product_types_list()
    mockup_types_list = get_mockup_types_list()
    return render(request, 'production/mockup_product_types.html', {
        'mockup_product_types': mockup_product_types_list,
        'mockup_types': mockup_types_list
    })


@login_required(login_url='login')
@try_except
def new_mockup_product_type(request):
    form = NewMockupProductTypeForm(request.POST)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect('mockup_product_types.html')


@login_required(login_url='login')
@try_except
def del_mockup_product_type(request):
    mockup_product_type = get_object_or_404(Mockup_product_type, pk=request.POST.get('id'))
    form = DelMockupProductTypeForm(request.POST, instance=mockup_product_type)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect('mockup_product_types.html')
