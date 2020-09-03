from django.contrib.auth.models import User
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse
from django.db import transaction
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import json
from .models import Document, Ct, Order_doc, Order_doc_type, File
from accounts.models import UserProfile
from .forms import NewDocForm
from docs.api.orders_mail_sender import arrange_mail
from docs.api.orders_api import post_files, post_order, change_order, cancel_another_order, \
    deactivate_files, get_order_code_for_table, deactivate_order, sort_orders, filter_orders, get_order_info
from plxk.api.datetime_normalizers import normalize_day, normalize_month
from plxk.api.try_except import try_except
from plxk.api.global_getters import get_employees_list, get_deps, get_emp_seats_list


def user_can_edit(user):
    return user.is_authenticated() and user.has_perm("docs.change_document")


@login_required(login_url='login')
@try_except
def index(request):
    docs = Document.objects.all().order_by('name')
    edit = user_can_edit(request.user)
    return render(request, 'docs/index.html', {'docs': docs, 'edit': edit})


@login_required(login_url='login')
@try_except
def docs(request, fk):
    if fk == '0':
        docs = Document.objects.all().filter(actuality=True).order_by('name')
    elif fk == '666':
        docs = Document.objects.all().filter(actuality=False).order_by('name')
    else:
        docs = Document.objects.all().filter(doc_group=fk).filter(actuality=True).order_by('name')
    edit = user_can_edit(request.user)
    return render(request, 'docs/index.html', {'docs': docs, 'edit': edit, 'fk': fk})


@login_required(login_url='login')
@try_except
def new_doc(request):
    title = 'Новий документ'
    if request.user:
        user = request.user
    else:
        user = User.objects.first()
    #user =HttpRequest.user.
    if request.method == 'POST':
        form = NewDocForm(request.POST, request.FILES)
        if form.is_valid():
            doc = Document.objects.create(
                name=form.cleaned_data.get('name'),
                code=form.cleaned_data.get('code'),
                doc_type=form.cleaned_data.get('doc_type'),
                doc_group=form.cleaned_data.get('doc_group'),
                date_start=form.cleaned_data.get('date_start'),
                author=form.cleaned_data.get('author'),
                responsible=form.cleaned_data.get('responsible'),
                act=form.cleaned_data.get('act'),
                doc_file=request.FILES['doc_file'],
                created_by=user
            )
            return redirect('docs:index')
    else:
        form = NewDocForm()
    return render(request, 'docs/new_doc.html', {'form': form, 'title': title})


@login_required(login_url='login')
@try_except
def edit_doc(request, pk):
    doc = get_object_or_404(Document, pk=pk)
    title = 'Редагування'

    if request.user:
        user = request.user
    else:
        user = User.objects.first()
    if request.method == 'POST':
        form = NewDocForm(request.POST, request.FILES, instance=doc)
        if form.is_valid():
            doc.updated_by = user
            doc.updated_at = timezone.now()
            form.save()
        return redirect('docs:index')
    else:
        form = NewDocForm(instance=doc)
    return render(request, 'docs/new_doc.html', {'form': form, 'title': title})


# ------------------------------------------------------------------------------------------------------------ Orders
@login_required(login_url='login')
@try_except
def orders(request):
    if request.user.id:
        is_orders_admin = UserProfile.objects.values_list('is_orders_admin', 'is_it_admin').filter(user_id=request.user.id)[0]
    else:
        is_orders_admin = [False]

    # Переробляємо True у 'true', так його зрозуміє js
    is_orders_admin = 'true' if True in is_orders_admin else 'false'

    types = list(Order_doc_type.objects.values())

    employees = get_employees_list()
    emp_seats = get_emp_seats_list()

    orders = [{
        'id': order.id,
        'code': get_order_code_for_table(order.id, order.doc_type.name, order.code),
        'doc_type': order.doc_type.name,
        'name': order.name,
        'author__last_name': order.author.last_name + ' ' + order.author.first_name,
        'date_start': str(order.date_start.year) + '-' +
                      normalize_month(order.date_start) + '-' +
                      normalize_day(order.date_start) if order.date_start else '',
        'date_canceled': str(order.date_canceled.year) + '-' +
                         normalize_month(order.date_canceled) + '-' +
                         normalize_day(order.date_canceled) if order.date_canceled else '',
        'is_actual': order.is_act,
        'status': 'ok' if order.done else 'in progress'
    } for order in Order_doc.objects.filter(is_act=True)]

    return render(request, 'docs/orders/index.html', {'orders': json.dumps(orders),
                                                       'types': json.dumps(types),
                                                       'is_orders_admin': is_orders_admin,
                                                       'employees': json.dumps(employees),
                                                       'emp_seats': json.dumps(emp_seats)})


@login_required(login_url='login')
@try_except
# Pagination
def get_orders(request, page):
    orders = Order_doc.objects.filter(is_act=True)
    orders = filter_orders(orders, json.loads(request.POST['filtering']))
    orders = sort_orders(orders, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(orders, 100)
    try:
        orders_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        orders_page = paginator.page(1)
    except EmptyPage:
        orders_page = paginator.page(1)

    orders_list = [{
        'id': order.id,
        'code': get_order_code_for_table(order.id, order.doc_type.name, order.code),
        'doc_type': order.doc_type.name,
        'name': order.name,
        'author__last_name': order.author.last_name + ' ' + order.author.first_name,
        'date_start': str(order.date_start.year) + '-' +
                      normalize_month(order.date_start) + '-' +
                      normalize_day(order.date_start) if order.date_start else '',
        'date_canceled': str(order.date_canceled.year) + '-' +
                         normalize_month(order.date_canceled) + '-' +
                         normalize_day(order.date_canceled) if order.date_canceled else '',
        'is_actual': order.is_act
    } for order in orders_page.object_list]

    response = {'rows': orders_list, 'pagesCount': paginator.num_pages}
    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@try_except
def get_order(request, pk):
    deps = get_deps()
    response = {'deps': deps}

    if pk != '0':
        order = get_order_info(pk)
        response.update({'order': order})

    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@transaction.atomic
@try_except
def add_order(request):
    post_request = request.POST.copy()
    post_request.update({'created_by': request.user.id})

    order = post_order(post_request)
    post_request.update({'order': order.pk, 'id': order.pk})

    post_files(request.FILES, post_request)
    cancel_another_order(post_request)

    arrange_mail(post_request)

    return HttpResponse(order.pk)


@login_required(login_url='login')
@transaction.atomic
@try_except
def edit_order(request):
    post_request = request.POST.copy()
    post_request.update({'created_by': request.user.id})

    change_order(post_request)

    post_files(request.FILES, post_request)
    deactivate_files(json.loads(post_request['old_files_to_delete']))
    cancel_another_order(post_request)

    arrange_mail(post_request)

    return HttpResponse()


@login_required(login_url='login')
@transaction.atomic
@try_except
def deact_order(request):
    post_request = request.POST.copy()
    # post_request.update({'updated_by': request.user.id})
    deactivate_order(post_request)
    return HttpResponse()
