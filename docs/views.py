from django.contrib.auth.models import User
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse
from django.db import transaction
from django.utils import timezone
import json
from .models import Document, Ct, Order_doc, Order_doc_type, File
from accounts.models import UserProfile
from .forms import NewDocForm
from docs.api.orders_mail_sender import arrange_mail
from docs.api.orders_api import post_files, post_order, change_order, cancel_another_order, get_order_code, deactivate_files, get_order_code_for_table, deactivate_order
from plxk.api.datetime_normalizers import normalize_day, normalize_month


def user_can_edit(user):
    return user.is_authenticated() and user.has_perm("docs.change_document")


def index(request):
    docs = Document.objects.all()
    edit = user_can_edit(request.user)
    return render(request, 'docs/index.html', {'docs': docs, 'edit': edit})


def docs(request, fk):
    if fk == '0':
        docs = Document.objects.all().filter(actuality=True)
    elif fk == '666':
        docs = Document.objects.all().filter(actuality=False)
    else:
        docs = Document.objects.all().filter(doc_group=fk).filter(actuality=True)
    edit = user_can_edit(request.user)
    return render(request, 'docs/index.html', {'docs': docs, 'edit': edit, 'fk': fk})


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
def orders(request):
    if request.user.id:
        is_orders_admin = UserProfile.objects.values_list('is_orders_admin', 'is_it_admin').filter(user_id=request.user.id)[0]
    else:
        is_orders_admin = [False]

    # Переробляємо True у 'true', так його зрозуміє js
    is_orders_admin = 'true' if True in is_orders_admin else 'false'

    types_list = list(Order_doc_type.objects.values())

    employee_list = [{
            'id': emp.pk,
            'name': emp.last_name + ' ' + emp.first_name,
            'mail': emp.email
        } for emp in
            User.objects.only('id', 'last_name', 'first_name')
                .exclude(id=10)  # Викидуємо зі списка користувача Охорона
                .order_by('last_name')]

    orders_list = [{
        'id': order.id,
        'code': get_order_code_for_table(order.id, order.doc_type.name, order.code),
        'type_name': order.doc_type.name,
        'name': order.name,
        'author_name': order.author.last_name + ' ' + order.author.first_name,
        'date_start': str(order.date_start.year) + '-' +
                      normalize_month(order.date_start) + '-' +
                      normalize_day(order.date_start) if order.date_start else '',
        'date_canceled': str(order.date_canceled.year) + '-' +
                         normalize_month(order.date_canceled) + '-' +
                         normalize_day(order.date_canceled) if order.date_canceled else '',
        'is_actual': order.is_act
    } for order in Order_doc.objects.filter(is_act=True)]

    return render(request, 'docs/orders/orders.html', {'orders_list': json.dumps(orders_list),
                                                       'types_list': json.dumps(types_list),
                                                       'is_orders_admin': is_orders_admin,
                                                       'employee_list': employee_list})


def get_order(request, pk):
    order = get_object_or_404(Order_doc, pk=pk)

    order = {
        'id': order.id,
        'code': order.code,
        'type_id': order.doc_type_id,
        'type_name': order.doc_type.name,
        'name': order.name,
        'author_id': order.author_id,
        'author_name': order.author.last_name + ' ' + order.author.first_name,
        'canceled_by_id': order.canceled_by_id,
        'canceled_by_code': get_order_code(order.canceled_by.id) if order.canceled_by_id else '',
        'cancels_id': order.cancels_id if order.cancels_id else '',
        'cancels_code': order.cancels_code if order.cancels_code else get_order_code(order.cancels_id),
        'date_start': str(order.date_start.year) + '-' +
                         normalize_month(order.date_start) + '-' +
                         normalize_day(order.date_start) if order.date_start else '',
        'date_canceled': str(order.date_canceled.year) + '-' +
                         normalize_month(order.date_canceled) + '-' +
                         normalize_day(order.date_canceled) if order.date_canceled else '',
        'responsible_id': order.responsible_id,
        'responsible_name': order.responsible.last_name + ' ' + order.responsible.first_name,
        'supervisory_id': order.supervisory_id,
        'supervisory_name': order.supervisory.last_name + ' ' + order.supervisory.first_name
    }

    old_files = [{
        'id': file.id,
        'name': file.name,
        'file': file.file.name,
        'is_added_or_cancelled': file.is_added_or_cancelled
    } for file in File.objects.filter(is_active=True).filter(order__id=order['id'])]

    order.update({'old_files': old_files, 'files': []})

    return HttpResponse(json.dumps(order))


@transaction.atomic
def new_order(request):
    post_request = request.POST.copy()
    post_request.update({'created_by': request.user.id})

    order = post_order(post_request)
    post_request.update({'order': order.pk, 'id': order.pk})

    post_files(request.FILES, post_request)
    cancel_another_order(post_request)

    arrange_mail(post_request)

    return HttpResponse(order.pk)


@transaction.atomic
def edit_order(request):
    post_request = request.POST.copy()
    post_request.update({'created_by': request.user.id})

    change_order(post_request)

    post_files(request.FILES, post_request)
    deactivate_files(json.loads(post_request['old_files_to_delete']))
    cancel_another_order(post_request)

    arrange_mail(post_request)

    return HttpResponse()


@transaction.atomic
def deact_order(request):
    post_request = request.POST.copy()
    # post_request.update({'updated_by': request.user.id})
    deactivate_order(post_request)
    return HttpResponse()
