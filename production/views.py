import json
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from plxk.api.global_getters import get_simple_emp_seats_list
from .forms import NewMockupTypeForm, DelMockupTypeForm, NewMockupProductTypeForm, DelMockupProductTypeForm, \
    NewProductTypeForm, DelProductForm, NewScopeForm, DelScopeForm, NewPermissionCategoryForm, DelPermissionCategoryForm
from production.api.getters import *
from production.api.setters import add_or_change_contract_subject, deactivate_contract_subject


@try_except
def get_products(request, direction=''):
    return HttpResponse(json.dumps(get_product_types_list(direction)))


@login_required(login_url='login')
@try_except
def products(request):
    products_list = get_product_types_list()
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
    products = get_product_types_list(direction)
    sub_products = get_sub_products(direction)
    return HttpResponse(json.dumps({'products': products, 'sub_products': sub_products}))


@try_except
def get_product_types_flat(request, direction):
    product_types = get_product_types_list(direction)
    return HttpResponse(json.dumps(product_types))


@try_except
def get_products_for_product_type(request, product_type_id):
    products = get_products_list(product_type_id)
    return HttpResponse(json.dumps(products))


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


@login_required(login_url='login')
@try_except
def permission_categories(request):
    permission_categories_list = get_permission_categories_list()
    return render(request, 'production/permission_categories.html', {'permission_categories': permission_categories_list})


@try_except
def new_permission_category(request):
    form = NewPermissionCategoryForm(request.POST)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect('permission_categories.html')


@try_except
def del_permission_category(request):
    permission_category = get_object_or_404(Permission_Category, pk=request.POST.get('id'))
    form = DelPermissionCategoryForm(request.POST, instance=permission_category)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect('permission_categories.html')


@login_required(login_url='login')
@try_except
def get_permission_categories(request):
    return HttpResponse(json.dumps(get_permission_categories_list()))


@login_required(login_url='login')
@try_except
def contract_subjects(request):
    if request.user.userprofile.is_it_admin or request.user.userprofile.contract_subject_edit:
        employees = get_simple_emp_seats_list()
        contract_subjects = get_contract_subjects()
        return render(request, 'production/contract_subjects/index.html', {'contract_subjects': contract_subjects,
                                                                       'employees': employees})
    return render(request, '../templates/denied.html')


@login_required(login_url='login')
@try_except
def contract_subjects_select(request):
    return HttpResponse(json.dumps(get_contract_subjects()))


@try_except
def post_contract_subject(request):
    new_cs_id = add_or_change_contract_subject(request)
    return HttpResponse(new_cs_id)


@try_except
def del_contract_subject(request):
    return HttpResponse(deactivate_contract_subject(request.POST['id']))
