from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import FilteredRelation, Q
from django.conf import settings
import json
from plxk.api.try_except import try_except
from plxk.api.convert_to_local_time import convert_to_localtime
from accounts.models import Department
from edms.models import Document, Document_Path
from edms.api.getters import get_my_seats, get_sub_emps
from django.shortcuts import get_object_or_404

testing = settings.STAS_DEBUG


# --------------------------------------- archive
@try_except
def get_archive_docs(request, archive_type, meta_doc_type_id, page):
    # Архів документів, створених даним юзером
    archive = Document_Path.objects \
        .filter(document__document_type__meta_doc_type_id=meta_doc_type_id) \
        .filter(mark=1) \
        .filter(document__testing=testing) \
        # .filter(document__closed=False)

    # Фільтрація відповідно до типу архіву (мій архів, архів відділу, архів підлеглих)
    if archive_type == 'my':
        archive = filter_archive_my(request, archive)
    elif archive_type == 'dep':
        archive = filter_archive_dep(request, archive)
    elif archive_type == 'subs':
        archive = filter_archive_subs(request, archive)

    # Фільтрація і сортування у таблиці
    archive = filter_archive_query(archive, json.loads(request.POST['filtering']))
    archive = sort_archive_query(archive, request.POST['sort_name'], request.POST['sort_direction'])

    # Пажинація
    paginator = Paginator(archive, 25)
    try:
        archive_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        archive_page = paginator.page(1)
    except EmptyPage:
        archive_page = paginator.page(1)

    # Формуємо остаточний список
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
def filter_archive_my(request, archive):
    # Знаходимо всі документи, створені користувачем
    return archive.filter(employee_seat__employee_id=request.user.userprofile.id)


@try_except
def filter_archive_dep(request, archive):
    # Визначаємо список відділів, у яких працює користувач
    my_seats = get_my_seats(request.user.userprofile.id)
    my_deps = [x['dep_id'] for x in my_seats]
    deps_without_dublicates = list(set(my_deps))

    # Знаходимо всі документи, створені працівниками цих відділів
    archive = archive.filter(employee_seat__seat__department_id__in=deps_without_dublicates)
    return archive


@try_except
def filter_archive_subs(request, archive):
    # Знаходимо всі посади користувача
    my_seats = get_my_seats(request.user.userprofile.id)
    my_seats_ids = [x['seat_id'] for x in my_seats]

    # Генеральним директорам просто показуємо всіх працівників крім іншого гендиректора
    if 16 in my_seats_ids:
        archive = archive \
            .exclude(employee_seat__employee_id=request.user.userprofile.id) \
            .exclude(employee_seat__seat_id=247)
    elif 247 in my_seats_ids:
        archive = archive \
            .exclude(employee_seat__employee_id=request.user.userprofile.id) \
            .exclude(employee_seat__seat_id=16)
    else:
        # Іншим рекурсією знаходимо всіх підлеглих і їх підлеглих
        subs = get_subs_userprofile_ids(my_seats_ids)
        archive = archive.filter(employee_seat__employee_id__in=subs)

        # Прибираємо створені користувачем документи, бо він потрапляє у список підлеглих (колись виправлю).
        archive = archive.exclude(employee_seat__employee_id=request.user.userprofile.id)

    return archive


# --------------------------------------- work archive
@try_except
def get_work_archive_docs(request, archive_type, meta_doc_type_id, page):
    # Документи, з якими мав справу користувач:
    # Додаємо автора з першого path через annotate
    work_archive = Document.objects\
        .annotate(first_path=FilteredRelation('path', condition=Q(path__mark_id=1), ), )\
        .filter(document_type__meta_doc_type_id=meta_doc_type_id)\
        .filter(testing=testing) \
        .exclude(closed=True) \
        .exclude(first_path__isnull=True) \
        .values('id',
                'document_type__description',
                'document_type_id',
                'main_field',
                'first_path__employee_seat__employee__pip',
                'date')

    # Фільтрація відповідно до типу архіву (мій архів, архів відділу, архів підлеглих)
    if archive_type == 'my':
        work_archive = filter_work_archive_my(request, work_archive)
    elif archive_type == 'dep':
        work_archive = filter_work_archive_dep(request, work_archive)
    elif archive_type == 'subs':
        work_archive = filter_work_archive_subs(request, work_archive)

    # Прибираємо дублікати.
    work_archive = work_archive.distinct()

    # Фільтрація і сортування у таблиці
    work_archive = filter_work_archive_query(work_archive, json.loads(request.POST['filtering']))
    work_archive = sort_work_archive_query(work_archive, request.POST['sort_name'], request.POST['sort_direction'])

    # Пажинація
    paginator = Paginator(work_archive, 25)
    try:
        work_archive_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        work_archive_page = paginator.page(1)
    except EmptyPage:
        work_archive_page = paginator.page(1)

    # Формуємо остаточний список
    work_archive_list = [{
        'id': doc['id'],
        'type': doc['document_type__description'],
        'type_id': doc['document_type_id'],
        'main_field': doc['main_field'],
        'author': doc['first_path__employee_seat__employee__pip'],
        'date': convert_to_localtime(doc['date'], 'day'),
    } for doc in work_archive_page]

    return {'rows': work_archive_list, 'pagesCount': paginator.num_pages}


@try_except
def filter_work_archive_my(request, work_archive):
    # Залишаємо лише ті документи, в яких є path (mark) користувача
    work_archive = work_archive.filter(path__employee_seat__employee_id=request.user.userprofile.id)

    # Прибираємо створені користувачем документи.
    work_archive = work_archive.exclude(first_path__employee_seat__employee_id=request.user.userprofile.id)

    return work_archive


@try_except
def filter_work_archive_dep(request, work_archive):
    # Визначаємо список відділів, у яких працює користувач
    my_seats = get_my_seats(request.user.userprofile.id)
    my_deps = [x['dep_id'] for x in my_seats]
    deps_without_dublicates = list(set(my_deps))

    # Залишаємо лише ті документи, в яких є path (mark) співробітників відділів
    work_archive = work_archive.filter(path__employee_seat__seat__department_id__in=deps_without_dublicates)

    # Прибираємо створені працівниками відділів документи.
    work_archive = work_archive.exclude(first_path__employee_seat__seat__department_id__in=deps_without_dublicates)

    return work_archive


@try_except
def filter_work_archive_subs(request, work_archive):
    # Знаходимо всі посади користувача
    my_seats = get_my_seats(request.user.userprofile.id)
    my_seats_ids = [x['seat_id'] for x in my_seats]

    # Генеральним директорам просто показуємо всіх працівників крім іншого гендиректора
    if 16 in my_seats_ids:
        work_archive = work_archive \
            .exclude(employee_seat__employee_id=request.user.userprofile.id) \
            .exclude(employee_seat__seat_id=247)
    elif 247 in my_seats_ids:
        work_archive = work_archive \
            .exclude(employee_seat__employee_id=request.user.userprofile.id) \
            .exclude(employee_seat__seat_id=16)
    else:
        # Іншим рекурсією знаходимо всіх підлеглих і їх підлеглих
        subs = get_subs_userprofile_ids(my_seats_ids)

        # Залишаємо лише ті документи, в яких є path (mark) підлеглих
        work_archive = work_archive.filter(path__employee_seat__employee_id__in=subs)

        # Прибираємо створені підлеглими документи.
        work_archive = work_archive.exclude(first_path__employee_seat__employee_id__in=subs)

    return work_archive


@try_except
def get_subs_userprofile_ids(my_seats_ids):
    subs = []
    subs_without_dublicates = []
    for my_seat in my_seats_ids:
        my_seat_subs = get_sub_emps(my_seat, True, True)
        if my_seat_subs:
            subs = subs + my_seat_subs
            subs_userprofile_ids = [x['userprofile_id'] for x in subs]
            subs_without_dublicates = list(set(subs_userprofile_ids))
    return subs_without_dublicates


# --------------------------------------------------- фільтрація і сортування з таблиць
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
        elif filter['columnName'] == 'author':
            query_set = query_set.filter(document__employee_seat__employee__pip__icontains=filter['value'])
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
