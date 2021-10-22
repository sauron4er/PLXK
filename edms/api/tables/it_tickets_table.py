from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from plxk.api.datetime_normalizers import date_to_json
import json

from edms.models import Document
from plxk.api.try_except import try_except


# При True у списках відображаться документи, які знаходяться в режимі тестування.
from django.conf import settings
testing = settings.STAS_DEBUG


@login_required(login_url='login')
@try_except
def get_it_tickets_table(request, doc_type_version, page):
    it_tickets_docs = Document.objects.filter(document_type__meta_doc_type_id=12).filter(is_active=1)

    old_it_ticket_docs = []  # TODO інформація зі старих типів документів

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

    if doc_type_version == '5':
        it_tickets_docs = [{
            'id': it_ticket.pk,
            'author': it_ticket.employee_seat.employee.pip,
            'name': get_name(it_ticket),
            'purpose': get_purpose(it_ticket),
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
def get_purpose(free_time_doc):
    text = free_time_doc.texts.all()
    if text:
        return text[0].text
    return ''


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
        filter_field = filter['columnName']
        if filter['columnName'] == 'author':
            filter_field = 'employee_seat__employee__pip'
        elif filter['columnName'] == 'purpose':
            filter_field = 'texts__text'
        elif filter['columnName'] == 'datetime':
            filter_field = 'datetimes__datetime'

        kwargs = {'{}__{}'.format(filter_field, 'icontains'): filter['value']}
        query_set = query_set.filter(**kwargs)
    return query_set
