import json
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from .forms import NewMockupTypeForm, DelMockupTypeForm, NewMockupProductTypeForm, DelMockupProductTypeForm, \
    NewProductTypeForm, DelProductForm, NewScopeForm, DelScopeForm
from production.api.getters import *


@try_except
def get_products(request, direction=''):
    return HttpResponse(json.dumps(get_products_list(direction)))


@login_required(login_url='login')
@try_except
def products(request):
    products_list = get_products_list()
    meta_types = get_meta_types()
    return render(request, 'production/products.html', {'products': products_list, 'meta_types': meta_types})


@try_except
def new_product(request):
    request_post = request.POST.copy()
    request_post['meta_type'] = request_post['meta_type'] if request_post['meta_type'] != '' else None
    form = NewProductTypeForm(request.POST)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect('products.html')


@try_except
def del_product(request):
    product = get_object_or_404(Product_type, pk=request.POST.get('id'))
    form = DelProductForm(request.POST, instance=product)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect('products.html')


@try_except
def get_mockup_types(request):
    return HttpResponse(json.dumps(get_mockup_types_list()))


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


@try_except
def get_mockup_product_types(request):
    return HttpResponse(json.dumps(get_mockup_product_types_list()))


@try_except
def get_product_types(request, direction):
    products = get_products_list(direction)
    sub_products = get_sub_products(direction)
    return HttpResponse(json.dumps({'products': products, 'sub_products': sub_products}))


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


@login_required(login_url='login')
@try_except
def scopes(request):
    scopes_list = get_scopes_list()
    return render(request, 'production/scopes.html', {'scopes': scopes_list})


@try_except
def new_scope(request):
    form = NewScopeForm(request.POST)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect('scopes.html')


@try_except
def del_scope(request):
    scope = get_object_or_404(Scope, pk=request.POST.get('id'))
    form = DelScopeForm(request.POST, instance=scope)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect('scopes.html')


@login_required(login_url='login')
@try_except
def get_scopes(request):

    return HttpResponse(json.dumps(get_scopes_list()))
