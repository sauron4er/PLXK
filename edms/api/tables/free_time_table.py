from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from plxk.api.datetime_normalizers import date_to_json
import json

from edms.models import Document
from plxk.api.try_except import try_except
from plxk.api.convert_to_local_time import convert_to_localtime


# При True у списках відображаться документи, які знаходяться в режимі тестування.
from django.conf import settings
testing = settings.STAS_DEBUG


@login_required(login_url='login')
@try_except
def get_free_times_table(request, page):
    free_time_docs = Document.objects.filter(document_type__meta_doc_type_id=1).filter(is_active=1)

    if not testing:
        free_time_docs = free_time_docs.filter(testing=False)

    free_time_docs = table_filter(free_time_docs, json.loads(request.POST['filtering']))
    free_time_docs = table_sort(free_time_docs, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(free_time_docs, 20)
    try:
        free_time_docs_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        free_time_docs_page = paginator.page(1)
    except EmptyPage:
        free_time_docs_page = paginator.page(1)

    free_time_docs = [{
        'id': free_time.pk,
        'author': free_time.employee_seat.employee.pip,
        'employee': get_employee(free_time),
        'out': get_datetime(free_time, 'out'),
        'in': get_datetime(free_time, 'in'),
        'purpose': get_purpose(free_time),
        'doc_type': free_time.doc_type_version.description if free_time.doc_type_version else '',
    } for free_time in free_time_docs_page.object_list]

    return {'rows': free_time_docs, 'pagesCount': paginator.num_pages}


@try_except
def get_datetime(free_time_doc, type):
    if free_time_doc.document_type_id == 15:
        range = free_time_doc.foyer_ranges.all()
        if range:
            if type == 'out':
                return convert_to_localtime(range[0].out_datetime, 'datetime') if range[0].out_datetime else ''
            else:
                return convert_to_localtime(range[0].in_datetime, 'datetime') if range[0].in_datetime else ''
    else:  # free_time_doc.document_type_id == 1
        day = free_time_doc.days.all()
        if day:
            return date_to_json(day[0].day)
    return ''


@try_except
def get_purpose(free_time_doc):
    text = free_time_doc.texts.all()
    if text:
        return text[0].text
    return ''


@try_except
def get_employee(free_time_doc):
    employee = free_time_doc.employees.all()
    if employee:
        return employee[0].employee.pip + ' (' + employee[0].employee.tab_number + ')'
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
        if filter['columnName'] == 'author':
            query_set = query_set.filter(employee_seat__employee__pip__icontains=filter['value'])
        elif filter['columnName'] == 'employee':
            query_set = query_set.filter(employees__employee__pip__icontains=filter['value']) | \
                        query_set.filter(employees__employee__tab_number__icontains=filter['value'])
        elif filter['columnName'] == 'purpose':
            query_set = query_set.filter(texts__text__icontains=filter['value'])
        elif filter['columnName'] == 'doc_type':
            query_set = query_set.filter(doc_type_version__description__icontains=filter['value'])
    return query_set
