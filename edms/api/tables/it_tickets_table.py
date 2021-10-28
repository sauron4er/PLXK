from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from plxk.api.datetime_normalizers import date_to_json
import json

from edms.models import Document, Document_Path
from plxk.api.try_except import try_except
from plxk.api.datetime_normalizers import normalize_whole_date


# При True у списках відображаться документи, які знаходяться в режимі тестування.
from django.conf import settings
testing = settings.STAS_DEBUG


@login_required(login_url='login')
@try_except
def get_it_tickets_table(request, doc_type_version, page):
    it_tickets_docs = Document.objects\
        .filter(document_type__meta_doc_type_id=12)\
        .filter(doc_type_version=doc_type_version)\
        .filter(is_active=1)

    if not testing:
        it_tickets_docs = it_tickets_docs.filter(testing=False)

    it_tickets_docs = table_filter(it_tickets_docs, json.loads(request.POST['filtering']))
    it_tickets_docs = table_sort(it_tickets_docs, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(it_tickets_docs, 20)
    try:
        it_tickets_docs_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        it_tickets_docs_page = paginator.page(1)
    except EmptyPage:
        it_tickets_docs_page = paginator.page(1)

    if doc_type_version == '5':  # IT
        it_tickets_docs = [{
            'id': it_ticket.pk,
            'added_date': normalize_whole_date(
                Document_Path.objects.values('timestamp').filter(document_id=it_ticket.id).filter(mark_id=1)[0]),
            'done_date': get_done_date(it_ticket),
            'author': it_ticket.employee_seat.employee.pip,
            'name': get_name(it_ticket),
            'importancy': get_importancy(it_ticket),
            'stage': get_stage(it_ticket.stage),
        } for it_ticket in it_tickets_docs_page.object_list]

    elif doc_type_version == '6':  # 1C8
        it_tickets_docs = [{
            'id': it_ticket.pk,
            'added_date': normalize_whole_date(
                Document_Path.objects.values('timestamp').filter(document_id=it_ticket.id).filter(mark_id=1)[0]),
            'done_date': get_done_date(it_ticket),
            'author': it_ticket.employee_seat.employee.pip,
            'name': get_name(it_ticket),
            'company': it_ticket.company + ' ПЛХК',
            'accounting': get_accounting(it_ticket),
            'task_type': get_task_type(it_ticket),
            'importancy': get_importancy(it_ticket),
            'stage': get_stage(it_ticket.stage),
        } for it_ticket in it_tickets_docs_page.object_list]

    elif doc_type_version == '7':  # PLXK
        it_tickets_docs = [{
            'id': it_ticket.pk,
            'added_date': normalize_whole_date(
                Document_Path.objects.values('timestamp').filter(document_id=it_ticket.id).filter(mark_id=1)[0]),
            'done_date': get_done_date(it_ticket),
            'author': it_ticket.employee_seat.employee.pip,
            'name': get_name(it_ticket),
            'task_type': get_task_type(it_ticket),
            'importancy': get_importancy(it_ticket),
            'stage': get_stage(it_ticket.stage),
        } for it_ticket in it_tickets_docs_page.object_list]

    return {'rows': it_tickets_docs, 'pagesCount': paginator.num_pages}


@try_except
def get_name(it_ticket):
    if it_ticket.document_type_id == 16:
        name = it_ticket.texts.filter(queue_in_doc=1)
        if name:
            return name[0].text
    else:  # Старі заявки
        return ''
    return ''


@try_except
def get_task_type(it_ticket):
    if it_ticket.document_type_id == 16:
        task_type = it_ticket.texts.filter(queue_in_doc__in=[5, 6])
        if task_type:
            return task_type[0].text
    else:  # Старі заявки
        return ''
    return ''


@try_except
def get_importancy(it_ticket):
    if it_ticket.document_type_id == 16:
        importancy = it_ticket.texts.filter(queue_in_doc=7)
        if importancy:
            return importancy[0].text
    else:  # Старі заявки
        return ''
    return ''


@try_except
def get_accounting(it_ticket):
    if it_ticket.document_type_id == 16:
        accounting = it_ticket.texts.filter(queue_in_doc=4)
        if accounting:
            return accounting[0].text
    else:  # Старі заявки
        return ''
    return ''

@try_except
def get_done_date(doc):
    if doc.stage in ['done', 'confirm']:
        return normalize_whole_date(
            Document_Path.objects.values('timestamp').filter(document_id=doc.id).filter(mark_id=11).order_by('-id')[0]
        )
    return ''


@try_except
def get_stage(stage):
    if stage == 'done':
        return 'Виконано'
    elif stage == 'confirm':
        return 'Підтверджено'
    elif stage == 'in work':
        return 'В роботі'
    elif stage == 'denied':
        return 'Відмовлено'
    return 'Ініційовано'


@try_except
def table_sort(query_set, column, direction):
    if column:
        if direction == 'asc':
            direction = ''
        else:
            direction = '-'

        if column == 'datetime':
            column = 'datetimes__datetime'
        elif column == 'purpose':
            column = 'texts__text'
        elif column == 'author':
            column = 'employee_seat__employee__pip'

        query_set = query_set.order_by(direction + column)

    else:
        query_set = query_set.order_by('-id')

    return query_set


@try_except
def table_filter(query_set, filtering):
    for filter in filtering:
        if filter['columnName'] == 'author':
            query_set = query_set.filter(employee_seat__employee__pip__icontains=filter['value'])
        elif filter['columnName'] == 'name':
            query_set = query_set.filter(texts__queue_in_doc=1, texts__text__icontains=filter['value'])
        elif filter['columnName'] == 'company':
            if filter['value'] in ['ТДВ', 'тдв']:
                query_set = query_set.filter(company='ТДВ')
            elif filter['value'] in ['ТОВ', 'тов']:
                query_set = query_set.filter(company='ТОВ')
        elif filter['columnName'] == 'accounting':
            query_set = query_set.filter(texts__queue_in_doc=4, texts__text__icontains=filter['value'])
        elif filter['columnName'] == 'task_type':
            query_set = query_set.filter(texts__queue_in_doc__in=[5, 6], texts__text__icontains=filter['value'])
        elif filter['columnName'] == 'importancy':
            query_set = query_set.filter(texts__queue_in_doc=7, texts__text__icontains=filter['value'])
        elif filter['columnName'] == 'stage':
            value = filter['value'].lower()
            if value in 'ініційовано':
                query_set = query_set.filter(stage__isnull=True)
            elif value in 'в роботі':
                query_set = query_set.filter(stage='in work')
            elif value in 'виконано':
                query_set = query_set.filter(stage='done')
            elif value in 'підтверджено':
                query_set = query_set.filter(stage='confirm')
            elif value in 'відмовлено':
                query_set = query_set.filter(stage='denied')
    return query_set
