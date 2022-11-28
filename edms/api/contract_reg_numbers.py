from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import json
from plxk.api.try_except import try_except
from ..models import *


@try_except
def get_contract_reg_numbers_list(request, page):
    reg_numbers_query = Doc_Registration.objects\
        .filter(document__document_type__meta_doc_type_id=5)\
        .filter(document__closed=False)\
        .filter(is_active=True).order_by('-document__id')

    reg_numbers_query = filter_query_set(reg_numbers_query, json.loads(request.POST['filtering']))
    reg_numbers_query = sort_query_set(reg_numbers_query, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(reg_numbers_query, 24)
    try:
        reg_numbers_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        reg_numbers_page = paginator.page(1)
    except EmptyPage:
        reg_numbers_page = paginator.page(1)

    reg_numbers_list = [{
        'id': item.id,
        'reg_number': item.registration_number,
        'contract_subject': get_subject(item.document_id),
        # 'contract_counterparty': '',
        'document_id': item.document_id
    } for item in reg_numbers_page.object_list]

    response = {'rows': reg_numbers_list, 'pagesCount': paginator.num_pages}
    return response


@try_except
def get_subject(document_id):
    edms_doc = Document.objects.get(id=document_id)
    if edms_doc.document_type_id == 5:
        subject = Doc_Text.objects.filter(document_id=document_id).filter(queue_in_doc=2).values_list('text', flat=True)
    elif edms_doc.document_type_id in [7, 12, 14]:
        subject = Doc_Text.objects.filter(document_id=document_id).filter(queue_in_doc=4).values_list('text', flat=True)[0]
    else:
        subject_query = Doc_Contract_Subject.objects.get(document_id=document_id)
        if subject_query.contract_subject:
            subject = subject_query.contract_subject.name
        else:
            subject = subject_query.text
    return subject


@try_except
def sort_query_set(query_set, column, direction):
    direction_symbol = '' if direction == 'asc' else '-'

    if column == 'contract_subject':
        query_set = query_set
    elif column == 'document_id':
        query_set = query_set.order_by(direction_symbol + 'document__id')
    elif column == 'reg_number':
        query_set = query_set.order_by(direction_symbol + 'registration_number')

    return query_set


@try_except
def filter_query_set(query_set, filtering):
    for filter in filtering:
        if filter['columnName'] == 'reg_number':
            kwargs = {'{}__{}'.format('registration_number', 'icontains'): filter['value']}
            query_set = query_set.filter(**kwargs)
        # elif filter['columnName'] == 'contract_subject':
            # kwargs = {'{}__{}'.format('???', 'icontains'): filter['value']}
            # query_set = query_set.filter(**kwargs)
        elif filter['columnName'] == 'document_id':
            kwargs = {'{}__{}'.format('document__id', 'icontains'): filter['value']}
            query_set = query_set.filter(**kwargs)

    return query_set
