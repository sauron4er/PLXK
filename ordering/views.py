from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from datetime import datetime
import json
from plxk.api.try_except import try_except
from .models import Stationery_type, Stationery_order
from .api.getters import get_stationery_types_list, get_stationery_orders, get_summary_table


@login_required(login_url='login')
@try_except
def get_orders(request, month, year):
    orders = get_stationery_orders(request, month, year)
    return HttpResponse(json.dumps(orders))


@login_required(login_url='login')
@try_except
def stationery(request):
    is_admin = 'false'
    if request.user.userprofile.is_it_admin or request.user.userprofile.stationery_orders_view:
        is_admin = 'true'
    return render(request, 'ordering/stationery/stationery.html', {'is_admin': is_admin,
                                                                   'stationery_types': get_stationery_types_list(True, True)})


@login_required(login_url='login')
@try_except
def new_stationery_order(request):
    new_order = Stationery_order()
    new_order.stationery_type_id = request.POST['stationery_type']
    new_order.quantity = request.POST['quantity']
    new_order.department = request.user.userprofile.department
    new_order.author = request.user.userprofile
    new_order.month = datetime(int(request.POST['year']), int(request.POST['month']), 1)
    new_order.save()

    orders = get_stationery_orders(request, request.POST['month'], request.POST['year'])
    return HttpResponse(json.dumps(orders))


@login_required(login_url='login')
@try_except
def edit_stationery_order(request):
    order = get_object_or_404(Stationery_order, pk=request.POST.get('order_id'))
    order.quantity = request.POST['quantity']
    order.author = request.user.userprofile
    order.save()

    orders = get_stationery_orders(request, request.POST['month'], request.POST['year'])
    return HttpResponse(json.dumps(orders))


@login_required(login_url='login')
@try_except
def del_stationery_order(request):
    order = get_object_or_404(Stationery_order, pk=request.POST.get('order_id'))
    order.is_active = False
    order.save()

    orders = get_stationery_orders(request, request.POST['month'], request.POST['year'])
    return HttpResponse(json.dumps(orders))


@login_required(login_url='login')
@try_except
def get_summary(request, month, year):
    summary = get_summary_table(month, year)
    return HttpResponse(json.dumps(summary))


# ------------------------------------------------------------------------------------------------------- Довідник
@login_required(login_url='login')
@try_except
def stationery_catalogue(request):
    stationery_types_list = get_stationery_types_list()
    return render(request, 'ordering/stationery_catalogue.html', {
        'stationery_types': stationery_types_list
    })


@login_required(login_url='login')
@try_except
def new_stationery_type(request):
    new_st = Stationery_type()
    new_st.name = request.POST['name']
    new_st.measurement = request.POST['measurement']
    new_st.save()
    return HttpResponseRedirect('stationery_catalogue.html')


@login_required(login_url='login')
@try_except
def del_stationery_type(request):
    st = get_object_or_404(Stationery_type, pk=request.POST.get('id'))
    st.is_active = False
    st.save()
    return HttpResponseRedirect('stationery_catalogue.html')
