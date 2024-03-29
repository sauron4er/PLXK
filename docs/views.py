from pyexcelerate import Workbook, Style
from django_sendfile import sendfile
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.utils import timezone
from django.db import transaction
from django.http import Http404
from django.db.models import Q
from datetime import date
import json
from edms.models import Employee_Seat
from accounts.models import UserProfile
from plxk.api.try_except import try_except
from plxk.api.pagination import sort_query_set, filter_query_set
from plxk.api.global_getters import get_users_list, get_emp_seats_list
from plxk.api.datetime_normalizers import normalize_day, normalize_month, normalize_date
from .models import Document, Order_doc, Order_doc_type, Article_responsible
from .forms import NewDocForm, ResponsibleDoneForm, ArticleDoneForm, OrderDoneForm
from docs.api.orders_mail_sender import arrange_mail, send_order_reminders
from docs.api.orders_api import post_files, post_order, change_order, cancel_another_order, post_order_done, \
    deactivate_files, get_order_code_for_table, deactivate_order, get_order_info
from docs.api.order_articles_api import post_articles, post_responsible_files
from docs.api.docs_api import get_docs_list, user_can_edit


@login_required(login_url='login')
@try_except
def index(request):
    docs_list = get_docs_list('0')
    edit_perm = user_can_edit(request.user)
    return render(request, 'docs/index.html', {'docs_list': json.dumps(docs_list), 'edit_perm': 'true' if edit_perm else 'false'})


@login_required(login_url='login')
@try_except
def docs(request, fk):
    docs_list = get_docs_list(fk)
    edit_perm = user_can_edit(request.user)
    return render(request, 'docs/index.html', {'docs_list': json.dumps(docs_list), 'edit_perm': 'true' if edit_perm else 'false', 'fk': fk})


@login_required(login_url='login')
@try_except
def new_doc(request):
    title = 'Новий документ'
    edit_perm = user_can_edit(request.user)
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
    return render(request, 'docs/smya/new_doc.html', {'form': form, 'title': title, 'edit_perm': 'true' if edit_perm else 'false'})


@login_required(login_url='login')
@try_except
def edit_doc(request, pk, fk=''):
    edit_perm = user_can_edit(request.user)

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
    return render(request, 'docs/smya/new_doc.html', {'form': form, 'title': title, 'edit_perm': edit_perm})


@login_required(login_url='login')
@try_except
def get_docs_excel(request, fk='0'):

    docs_list = get_docs_list(fk, 'Excel')
    header = [['id', 'Тип', 'Група', 'Код', 'Назва',
               'Актуальність', 'Автор', 'Відповідальний',
               'Діє з']]

    wb = Workbook()
    ws = wb.new_sheet("summary", data=header + docs_list)
    ws.range("A1", "I1").style.font.bold = True
    ws.set_col_style(1, Style(size=5))
    ws.set_col_style(2, Style(size=20))
    ws.set_col_style(3, Style(size=20))
    ws.set_col_style(4, Style(size=20))
    ws.set_col_style(5, Style(size=130))
    ws.set_col_style(6, Style(size=15))
    ws.set_col_style(7, Style(size=40))
    ws.set_col_style(8, Style(size=40))
    ws.set_col_style(9, Style(size=10))

    wb.save('files/media/docs/docs.xlsx')

    return sendfile(request, 'media/docs/docs.xlsx',
                    mimetype="vnd.openxmlformats-officedocument.spreadsheetml.sheet")


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

    employees = get_users_list()
    emp_seats = get_emp_seats_list()

    return render(request, 'docs/orders/index.html', {'types': json.dumps(types),
                                                      'is_orders_admin': is_orders_admin,
                                                      'employees': json.dumps(employees),
                                                      'emp_seats': json.dumps(emp_seats)})


@login_required(login_url='login')
@try_except
def get_orders(request, page):
    orders = Order_doc.objects.filter(is_act=True)
    orders = filter_query_set(orders, json.loads(request.POST['filtering']))
    sort_by = request.POST['sort_name'] if request.POST['sort_name'] != '' else 'date_start'
    orders = sort_query_set(orders, sort_by, request.POST['sort_direction'])

    paginator = Paginator(orders, 20)
    try:
        orders_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        orders_page = paginator.page(1)
    except EmptyPage:
        orders_page = paginator.page(1)

    orders_list = [{
        'id': order.id,
        'code': get_order_code_for_table(order.id, order.doc_type.name, order.code),
        'doc_type__name': order.doc_type.name,
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
    } for order in orders_page.object_list]

    response = {'rows': orders_list, 'pagesCount': paginator.num_pages}
    return HttpResponse(json.dumps(response))


@try_except
def sort_calendar_by_date(calendar):
    sorted_by_date = []
    date = ''
    sort_index = -1
    for item in calendar:
        if item['deadline'] != date:
            sorted_by_date.append({'date': item['deadline'], 'orders': [item]})
            sort_index += 1
            date = item['deadline']
        else:
            sorted_by_date[sort_index]['orders'].append(item)
    return sorted_by_date


@try_except
def sort_calendar_by_order(calendar):
    sorted_by_order = []
    for date in calendar:
        date_sorted_by_order = []
        order_code = ''
        sort_index = -1
        for item in date['orders']:
            if item['order_code'] != order_code:
                date_sorted_by_order.append({
                    'type': item['type'],
                    'order_code': item['order_code'],
                    'order_name': item['order_name'],
                    'id': item['order_id'],
                    'articles': [item]})
                sort_index += 1
                order_code = item['order_code']
            else:
                date_sorted_by_order[sort_index]['articles'].append(item)
        date['orders'] = date_sorted_by_order
        sorted_by_order.append(date)
    return sorted_by_order


@login_required(login_url='login')
@try_except
def get_calendar(request, view):
    today = date.today()

    my_calendar = Article_responsible.objects\
        .filter(done=False)\
        .filter(is_active=True)\
        .filter(article__is_active=True)\
        .filter(article__order__is_act=True)\
        .filter(Q(article__order__date_canceled__isnull=True) | Q(article__order__date_canceled__gte=today))\
        .order_by('article__deadline', 'article__order__code')

    is_it_admin = UserProfile.objects.values_list('is_orders_admin', flat=True).filter(user=request.user)[0]

    # if not is_it_admin:
    if view in ['my_calendar', 'constant_calendar']:
        my_emp_seats = Employee_Seat.objects.values_list('id', flat=True)\
            .filter(employee__user=request.user)\
            .filter(is_active=True)
        my_calendar = my_calendar.filter(employee_seat_id__in=my_emp_seats)

    if view == 'constant_calendar':
        my_calendar = my_calendar.filter(article__term='constant')
    else:
        my_calendar = my_calendar.exclude(article__term='constant')

    calendar = [{
        'type': item.article.order.doc_type.name,
        # 'date_canceled': item.article.order.date_canceled,
        'order_id': item.article.order.id,
        'order_code': item.article.order.code,
        'order_name': item.article.order.name,
        'text': item.article.text,
        'constant': False if item.article.deadline else True,
        'deadline': get_deadline(item.article),
        'responsible': item.id,
        'responsible_name': item.employee_seat.employee.pip + ', ' + item.employee_seat.seat.seat,
        # 'comment': item.comment if item.comment else '',
        # 'files_old': [{
        #         'id': file.id,
        #         'name': file.name,
        #         'file': file.file.name,
        #         'status': 'old'
        #     } for file in Responsible_file.objects.filter(responsible_id=item.id).filter(is_active=True)],
        # 'files': []
    } for item in my_calendar]

    sorted_by_date = sort_calendar_by_date(calendar)
    sorted_by_date_and_order = sort_calendar_by_order(sorted_by_date)

    if sorted_by_date_and_order and sorted_by_date_and_order[0]['date'] == 'Постійно':
        sorted_by_date_and_order.append(sorted_by_date_and_order[0])
        del sorted_by_date_and_order[0]

    return HttpResponse(json.dumps({'calendar': sorted_by_date_and_order, 'is_admin': is_it_admin}))


@try_except
def get_deadline(article):
    if article.term == 'term':
        date = normalize_date(article.deadline)
        return date or 'Без строку'
    elif article.term == 'constant':
        return 'Постійно'
    return 'Без строку'


@login_required(login_url='login')
@try_except
def reminders(request):
    send_order_reminders()
    return HttpResponse(200)


@login_required(login_url='login')
@try_except
def get_order(request, pk):
    try:
        order = get_object_or_404(Order_doc, pk=pk)
        if order.is_act:
            response = {'is_active': True, 'order': get_order_info(order, request.user.userprofile.id)}
        else:
            response = {'is_active': False}
        return HttpResponse(json.dumps(response))
    except Http404:
        return HttpResponse('Такого наказу не існує', status=404)


@login_required(login_url='login')
@transaction.atomic
@try_except
def add_order(request):
    post_request = request.POST.copy()
    post_request.update({'created_by': request.user.id})

    order = post_order(post_request)
    post_request.update({'order': order.pk, 'id': order.pk})

    post_articles(post_request)
    post_files(request.FILES, post_request)
    cancel_another_order(post_request)

    done = post_order_done(post_request)

    arrange_mail(post_request)

    response = {'new_id': order.pk, 'done': done}

    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@transaction.atomic
@try_except
def edit_order(request):
    post_request = request.POST.copy()
    post_request.update({'created_by': request.user.id, 'order': post_request['id']})

    change_order(post_request)

    post_articles(post_request)
    post_files(request.FILES, post_request)
    deactivate_files(json.loads(post_request['files_old']))
    cancel_another_order(post_request)

    done = post_order_done(post_request)

    arrange_mail(post_request)

    response = {'done': done}

    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@transaction.atomic
@try_except
def deact_order(request):
    deactivate_order(request)
    return HttpResponse()


@login_required(login_url='login')
@transaction.atomic
@try_except
def responsible_done(request, pk):
    post_request = request.POST.copy()
    post_request.update({'done': True})
    responsible_instance = get_object_or_404(Article_responsible, pk=pk)

    responsible_done_form = ResponsibleDoneForm(post_request, instance=responsible_instance)
    if responsible_done_form.is_valid():
        responsible_done_form.save()
    else:
        raise ValidationError('docs/views/responsible_done: responsible_done_form invalid')

    article_done = not responsible_instance.article.responsibles.filter(done=False).exists()
    if article_done:
        article_done_form = ArticleDoneForm(post_request, instance=responsible_instance.article)
        if article_done_form.is_valid():
            article_done_form.save()
        else:
            raise ValidationError('docs/views/responsible_done: article_done_form invalid')

    order_done = not responsible_instance.article.order.articles.filter(done=False).exists()
    if order_done:
        order_done_form = OrderDoneForm(post_request, instance=responsible_instance.article.order)
        if order_done_form.is_valid():
            order_done_form.save()
        else:
            raise ValidationError('docs/views/responsible_done: order_done_form invalid')

    return HttpResponse()


@transaction.atomic
@login_required(login_url='login')
@try_except
def post_responsible_file(request):
    post_responsible_files(request)
    return HttpResponse()
