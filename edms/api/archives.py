from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import FilteredRelation, Q
from django.conf import settings
import json
from django.db.models import Prefetch
from plxk.api.try_except import try_except
from plxk.api.convert_to_local_time import convert_to_localtime
from edms.models import Document, Document_Path
from edms.api.getters import get_main_field, get_doc_author

testing = settings.STAS_DEBUG


@try_except
def get_archive_by_doc_meta_type(user_id, meta_doc_type_id):  # deprecated after archive went to pagination
    # Документи, з якими мав справу користувач:
    # Витягуємо всі документи даного типу
    work_archive_query = Document.objects \
        .filter(document_type__meta_doc_type_id=meta_doc_type_id) \
        .filter(testing=testing) \
        .filter(closed=False)

    # Фільтруємо по path від користувача і прибираємо дублікати. 
    work_archive_query = work_archive_query\
        .filter(path__employee_seat__employee_id=user_id)\
        .distinct()

    # Підтягуємо в queryset інфу про path для визначення автора
    work_archive_query = work_archive_query.prefetch_related(
        Prefetch('path', queryset=Document_Path.objects.filter(mark_id=1))
    )

    work_archive_list = [{
        'id': doc.id,
        'type': doc.document_type.description,
        'type_id': doc.document_type_id,
        # 'date': convert_to_localtime(doc.date, 'day'),
        # 'emp_seat_id': 1,
        'author': get_doc_author(doc.id),
        # 'author_seat_id': 1,
        'main_field': get_main_field(doc),
    } for doc in work_archive_query]

    # for doc in work_archive_query:
    #     creator = [step.employee_seat.employee.pip for step in doc.path.all()]
    #     work_archive_list.append({'creator': creator[0]})

    # employee_seat.employee.pip

    # my_archive = [{  # Список документів, створених даним юзером
    #     'id': path.document.id,
    #     'type': path.document.document_type.description,
    #     'type_id': path.document.document_type.id,
    #     'date': convert_to_localtime(path.timestamp, 'day'),
    #     'emp_seat_id': path.employee_seat.id,
    #     'author': path.employee_seat.employee.pip,
    #     'author_seat_id': path.employee_seat.id,
    #     'main_field': get_main_field(path.document),
    # } for path in Document_Path.objects
    #     .filter(document__document_type__meta_doc_type_id=meta_doc_type_id)
    #     .filter(mark=1)
    #     .filter(employee_seat__employee_id=user_id)
    #     .filter(document__testing=testing)
    #     .filter(document__closed=False)]


    # work_archive_with_duplicates = [{  # Список документів, які були у роботі користувача
    #     'id': path.document_id,
    #     'type': path.document.document_type.description,
    #     'type_id': path.document.document_type_id,
    #     'date': convert_to_localtime(path.document.date, 'day'),
    #     'emp_seat_id': path.employee_seat_id,
    #     'author': path.document.employee_seat.employee.pip,
    #     'author_seat_id': path.document.employee_seat_id,
    #     'main_field': get_main_field(path.document),
    # } for path in Document_Path.objects.distinct()
    #     .filter(document__document_type__meta_doc_type_id=meta_doc_type_id)
    #     .filter(employee_seat_id__employee_id=user_id)
    #     .filter(document__testing=testing)
    #     .filter(document__closed=False)
    #     .exclude(document__employee_seat__employee=user_id)]
    # 
    # # Позбавляємось дублікатів:
    # work_archive = []
    # compare_list = []
    # for i in range(0, len(work_archive_with_duplicates)):
    #     # Порівнюємо документи по ід та ід людино-посади, бо один документ може попасти до декількох людинопосад людини
    #     entity = {
    #         'id': work_archive_with_duplicates[i]['id'],
    #         'emp_seat_id': work_archive_with_duplicates[i]['emp_seat_id']
    #     }
    #     if entity not in compare_list:
    #         compare_list.append(entity)
    #         work_archive.append(work_archive_with_duplicates[i])

    # TODO як позбавитись дублікатів, якщо користувач працював з документом під різними посадами?
    my_archive=[]

    return {'my_archive': my_archive, 'work_archive': work_archive_list}


@try_except
def get_my_archive_docs(request, meta_doc_type_id, page):
    # Архів документів, створених даним юзером
    archive = Document_Path.objects \
        .filter(document__document_type__meta_doc_type_id=meta_doc_type_id) \
        .filter(mark=1) \
        .filter(employee_seat__employee_id=request.user.userprofile.id) \
        .filter(document__testing=testing) \
        .filter(document__closed=False)

    archive = filter_archive_query(archive, json.loads(request.POST['filtering']))
    archive = sort_archive_query(archive, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(archive, 25)
    try:
        archive_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        archive_page = paginator.page(1)
    except EmptyPage:
        archive_page = paginator.page(1)

    archive_list = [{
        'id': path.document.id,
        'type': path.document.document_type.description,
        'type_id': path.document.document_type.id,
        'date': convert_to_localtime(path.timestamp, 'day'),
        'emp_seat_id': path.employee_seat.id,
        'author': path.employee_seat.employee.pip,
        'author_seat_id': path.employee_seat.id,
        'main_field': path.document.main_field,
    } for path in archive_page.object_list]

    return {'rows': archive_list, 'pagesCount': paginator.num_pages}


@try_except
def get_my_work_archive_docs(request, meta_doc_type_id, page):
    # Документи, з якими мав справу користувач:
    # Додаємо автора з першого path через annotate
    work_archive = Document.objects.annotate(first_path=FilteredRelation('path', condition=Q(path__mark_id=1), ), )\
        .filter(document_type__meta_doc_type_id=meta_doc_type_id)\
        .filter(testing=testing) \
        .exclude(closed=True) \
        .exclude(first_path__isnull=True) \
        .exclude(first_path__employee_seat__employee_id=request.user.userprofile.id)\
        .values('id',
                'document_type__description',
                'document_type_id',
                'main_field',
                'first_path__employee_seat__employee__pip')

    # Фільтруємо по path від користувача і прибираємо дублікати.
    work_archive = work_archive \
        .filter(path__employee_seat__employee_id=request.user.userprofile.id) \
        .distinct()

    work_archive = filter_work_archive_query(work_archive, json.loads(request.POST['filtering']))
    work_archive = sort_work_archive_query(work_archive, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(work_archive, 25)
    try:
        work_archive_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        work_archive_page = paginator.page(1)
    except EmptyPage:
        work_archive_page = paginator.page(1)

    work_archive_list = [{
        'id': doc['id'],
        'type': doc['document_type__description'],
        'type_id': doc['document_type_id'],
        'main_field': doc['main_field'],
        'author': doc['first_path__employee_seat__employee__pip']
    } for doc in work_archive_page]

    return {'rows': work_archive_list, 'pagesCount': paginator.num_pages}


@try_except
def sort_archive_query(query_set, column, direction):
    if column:
        if column == 'main_field':
            column = 'document__main_field'
        elif column == 'id':
            column = 'document_id'
        elif column == 'type':
            column = 'document__document_type__description'
        elif column == 'date':
            column = 'document__date'

        if direction == 'asc':
            query_set = query_set.order_by(column)
        else:
            query_set = query_set.order_by('-' + column)
    else:
        query_set = query_set.order_by('-id')

    return query_set


@try_except
def filter_archive_query(query_set, filtering):
    for filter in filtering:
        if filter['columnName'] == 'id':
            query_set = query_set.filter(document_id=filter['value'])
        elif filter['columnName'] == 'type':
            query_set = query_set.filter(document__document_type__description__icontains=filter['value'])
        elif filter['columnName'] == 'main_field':
            query_set = query_set.filter(document__main_field__icontains=filter['value'])
        elif filter['columnName'] == 'date':
            query_set = query_set.filter(document__date__year=filter['value'])
    return query_set


@try_except
def sort_work_archive_query(query_set, column, direction):
    if column:
        if column == 'type':
            column = 'document_type__description'
        if column == 'author':
            column = 'first_path__employee_seat__employee__pip'

        if direction == 'asc':
            query_set = query_set.order_by(column)
        else:
            query_set = query_set.order_by('-' + column)
    else:
        query_set = query_set.order_by('-id')

    return query_set


@try_except
def filter_work_archive_query(query_set, filtering):
    for filter in filtering:
        if filter['columnName'] == 'id':
            query_set = query_set.filter(id=filter['value'])
        elif filter['columnName'] == 'type':
            query_set = query_set.filter(document_type__description__icontains=filter['value'])
        elif filter['columnName'] == 'main_field':
            query_set = query_set.filter(main_field__icontains=filter['value'])
        elif filter['columnName'] == 'date':
            query_set = query_set.filter(date__year=filter['value'])
        elif filter['columnName'] == 'author':
            query_set = query_set.filter(first_path__employee_seat__employee__pip__icontains=filter['value'])
    return query_set
