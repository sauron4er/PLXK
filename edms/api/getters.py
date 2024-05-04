from django.conf import settings
from django.db.models import FilteredRelation, Q
import json
from django.core import serializers
from django.utils.timezone import datetime
from django.db.models import Exists, OuterRef
from django.shortcuts import get_object_or_404
from plxk.api.try_except import try_except
from plxk.api.convert_to_local_time import convert_to_localtime
from plxk.api.datetime_normalizers import date_to_json
from edms.api.vacations import vacation_check
from ..models import *
from docs.models import Contract
from edms.api.modules_getter import get_foyer_ranges, get_cost_rates, get_contract_subject, get_deadline, \
    get_employee_seat, get_decree_articles, get_integer, get_decimal, get_bag_test_fields, get_booleans, get_seat

testing = settings.STAS_DEBUG


# Повертає ід працівника, якщо це його основна посада, або ід працівника, замість якого цей працівник в.о.
@try_except
def get_main_employee(recipient):
    is_main = Employee_Seat.objects.values_list('is_main', 'acting_for_id').filter(id=recipient)[0]
    if not is_main[0]:
        return is_main[1]
    else:
        return recipient


def get_acting_flag(is_main):
    return ' (в.о.)' if not is_main else ''


@try_except
def get_doc_create_day(doc):
    create_day = doc.path.values_list('timestamp', flat=True).filter(mark_id=1)
    if create_day:
        return convert_to_localtime(create_day[0], 'day')
    return ''


# Функція, яка повертає інформацію про фазу документа
@try_except
def get_phase_info(doc_request):
    phase_id = doc_request['phase_id']
    if phase_id == '0':
        phase_id = Doc_Type_Phase.objects.values_list('id', flat=True) \
            .filter(document_type_id=doc_request['document_type']) \
            .filter(phase=0) \
            .filter(is_active=True)[0]

    return Doc_Type_Phase.objects.values('id', 'phase', 'mark_id') \
        .filter(id=phase_id)[0]


@try_except
def get_phase_id(doc_request):
    # Якщо phase_id = 0 в doc_request, то на ознайомлення відправляє автор, тому браузер не знає ід фази. Знаходимо її.
    phase = doc_request['phase_id']
    if phase == '0':
        phase = Doc_Type_Phase.objects.values_list('id', flat=True) \
            .filter(document_type_id=doc_request['document_type']) \
            .filter(phase=0) \
            .filter(is_active=True)[0]
    return phase


# Функція, яка рекурсією шукає всі підлеглі посади користувача і їх підлеглі (без користувачів, лише посади)
@try_except
def get_sub_seats(seat):
    seats = [{'id': seat.id} for seat in Seat.objects.filter(chief_id=seat)]  # Знаходимо підлеглих посади
    temp_seats = []
    if seats:  # якщо підлеглі є:
        for seat in seats:
            temp_seats.append({'id': seat['id']})  # додамо кожного підлеглого у список
            new_seats = get_sub_seats(seat['id'])  # і шукаємо його підлеглих
            if new_seats is not None:  # якщо підлеглі є, додаємо і їх у список
                for new_seat in new_seats:
                    temp_seats.append({'id': new_seat['id']})
        return temp_seats
    else:
        return None


# Знаходить всі підлеглі людино-посади конкретної посади
@try_except
def get_sub_emps(seat, with_fired=False, only_ids=False):
    # Знаходимо підлеглих посади:
    emp_seats = Employee_Seat.objects.filter(seat__chief_id=seat) \
        .filter(employee__is_pc_user=True) \
        .order_by('-is_active', 'employee__pip')

    if not with_fired:
        emp_seats = emp_seats.filter(is_active=True)

    emp_seats = [{
        'id': emp_seat.id,
        'seat': emp_seat.seat.seat,
        'seat_id': emp_seat.seat_id,
        'emp': emp_seat.employee.pip,
        'userprofile_id': emp_seat.employee_id,
    } for emp_seat in emp_seats]

    temp_emp_seats = []
    if emp_seats:  # якщо підлеглі є:
        for emp_seat in emp_seats:
            temp_emp_seats.append(emp_seat)  # додаємо підлеглого у список
            new_seats = get_sub_emps(emp_seat['seat_id'])  # і шукаємо його підлеглих
            if new_seats is not None:  # якщо підлеглі є, додаємо і їх у список
                for new_seat in new_seats:
                    temp_emp_seats.append(new_seat)
        return temp_emp_seats
    else:
        return None


@try_except
def get_meta_doc_types():
    doc_types_query = Document_Meta_Type.objects.filter(is_active=True)

    # Якщо параметр testing = False - програма показує лише ті типи документів, які не тестуються.
    if not testing:
        doc_types_query = doc_types_query.filter(testing=False)

    return [{
        'id': doc_type.id,
        'description': doc_type.description,
        # 'creator': '' if doc_type.creator_id is None else doc_type.creator.employee.pip,
    } for doc_type in doc_types_query]


@try_except
def is_access_granted(user, author_emp_seat, doc):
    emp_seats = user.userprofile.positions.all().filter(is_active=True).values_list('id', flat=True)
    seats = user.userprofile.positions.all().filter(is_active=True).values('seat_id', 'seat__department_id', 'seat__is_dep_chief')

    if doc.employee_seat_id in emp_seats:  # Це автор документу
        return True
    if doc.path.filter(employee_seat__in=emp_seats).exists():  # Мав документ у роботі
        return True
    if doc.document_demands.filter(recipient__in=emp_seats).exists():  # Мав документ у mark_demands
        return True
    if doc.document_demands.filter(recipient__in=emp_seats).exists():  # Керівник відділу автора
        return True
    if user.userprofile.department_id == 50:  # Працівник юридичного-адміністративного відділу
        return True
    if doc.employee_seat.seat.department_id == 2 and user.userprofile.id == 1302:
        # Акаунт ВТК Гість має доступ до всіх створених працівниками ВТК документів
        return True

    # Є дозвіл на перегляд усіх документів цього мета-типу
    is_view_granted = User_Doc_Type_View.objects \
        .filter(employee=user.userprofile) \
        .filter(meta_doc_type=doc.document_type.meta_doc_type) \
        .filter(is_active=True).exists()
    if is_view_granted:
        return True

    # Це начальник автора
    author_chief = get_dep_chief(doc.employee_seat.seat.department_id)
    if author_chief:
        author_chief_id = get_dep_chief(doc.employee_seat.seat.department_id)['id']
        seat_ids = [x['seat_id'] for x in seats]
        if author_chief_id in seat_ids:
            return True

    # Це начальник когось із працівників, у кого є доступ
    # 1. Знаходимо відділи працівників, які працювали над документом
    deps_query = Document.objects.filter(id=doc.id)\
        .annotate(doc_path=FilteredRelation('path', ), )\
        .values('doc_path__employee_seat__seat__department_id')\
        .distinct()
    deps_that_worked_on_doc = [dep['doc_path__employee_seat__seat__department_id'] for dep in deps_query]

    # 2. Знаходимо відділи, у яких є начальником даний користувач
    chief_of_deps_id = []
    for seat in seats:
        if seat['seat__is_dep_chief']:
            chief_of_deps_id.append(seat['seat__department_id'])

    # 3. Перевіряємо чи є користувач начальником хоча б одного з відділів, що працювали над документом
    chief_of_deps = list(set(deps_that_worked_on_doc).intersection(chief_of_deps_id))
    if len(chief_of_deps) > 0:
        return True

    # # TODO шукати усіх підлеглих усіх посад користувача, зараз шукаються лише підлеглі однієї посади
    # my_seat = Employee_Seat.objects.values_list('seat_id', flat=True).filter(id=emp_seat)[0]
    # sub_emps = get_sub_emps(my_seat)
    # sub_emps_flat = [sub_emp['id'] for sub_emp in sub_emps] if sub_emps else []
    #
    # if doc.employee_seat_id in sub_emps_flat:
    #     return True
    # if doc.path.filter(employee_seat__in=sub_emps_flat).exists():
    #     return True
    # if doc.document_demands.filter(recipient__in=sub_emps_flat).exists():
    #     return True

    return False


@try_except
def get_doc_author(doc_id):
    create_path = get_object_or_404(Document_Path, document_id=doc_id, mark_id=1)
    creator = create_path.employee_seat.employee.pip
    return creator


# Функція, яка рекурсією шукає всіх начальників посади користувача і їх начальників
@try_except
def get_chiefs_list(seat):
    # Знаходимо id посади начальника
    chief_id = (Seat.objects.only('chief_id').filter(id=seat).first()).chief_id
    # Знаходимо людинопосаду начальника
    chief = [{
        'id': empSeat.id,
        'name': empSeat.employee.pip,
        'seat': empSeat.seat.seat if empSeat.is_main is True else empSeat.seat.seat + ' (в.о.)',
    } for empSeat in
        Employee_Seat.objects.filter(seat_id=chief_id).filter(is_active=True).filter(employee__on_vacation=False)]

    temp_chiefs = []
    if chief_id is not None:  # якщо начальник є:
        temp_chiefs.append(chief[0])
        new_chiefs = get_chiefs_list(chief_id)  # і шукаємо його начальника і так далі
        if new_chiefs is not None:  # якщо начальники є, додаємо і їх у список
            for new_chief in new_chiefs:
                temp_chiefs.append({
                    'id': new_chief['id'],
                    'name': new_chief['name'],
                    'seat': new_chief['seat']
                })
        return temp_chiefs
    else:
        return None


# Повертає прізвище та посаду безпосереднього керівника даної посади
@try_except
def get_chief_emp_seat(emp_seat_id):
    chief_seat_id = Employee_Seat.objects.values_list('seat__chief_id', flat=True).filter(id=emp_seat_id)
    if chief_seat_id:
        # Знаходимо людинопосаду начальника
        chief = [{
            'emp_id': empSeat.employee.id,
            'emp_seat_id': empSeat.id,
            'name': empSeat.employee.pip,
            'seat': empSeat.seat.seat if empSeat.is_main is True else empSeat.seat.seat + ' (в.о.)',
        } for empSeat in
            Employee_Seat.objects.filter(seat_id=chief_seat_id[0]).filter(is_active=True).filter(
                employee__on_vacation=False)]
        if chief:
            return chief[0]  # БД має завжди повертати тільки один запис, який одночасно активний і не у відпустці
    return []


# Функція, яка повертає список всіх актуальних посад та керівників щодо цих посад юзера
@try_except
def get_my_seats(emp_id, only_active=True):
    my_seats = Employee_Seat.objects.filter(employee_id=emp_id)
    if only_active:
        my_seats = my_seats.filter(is_active=True)

    my_seats = [{  # Список посад юзера
        'id': empSeat.id,
        'seat_id': empSeat.seat_id,
        'seat': empSeat.seat.seat if empSeat.is_main else '(в.о.) ' + empSeat.seat.seat,
        'dep_id': empSeat.seat.department.id
    } for empSeat in my_seats]

    for emp_seat in my_seats:
        chief = get_chief_emp_seat(emp_seat['id'])
        if chief:
            emp_seat.update({
                'chief': chief['name'] + ', ' + chief['seat'],
                'chief_emp_id': chief['emp_id']
            })
    return my_seats


# Функція, яка повертає з бд елементарний список посад
@try_except
def get_seats(what_for=''):
    if what_for == 'select':
        seats = [{
            'id': seat.pk,
            'name': seat.seat,
        } for seat in Seat.objects.filter(is_active=True).order_by('seat')]
    else:
        seats = [{
            'id': seat.pk,
            'seat': seat.seat,
        } for seat in Seat.objects.filter(is_active=True).order_by('seat')]
    return seats


@try_except
def get_dep_seats_list(dep_id):
    seats = [{
        'id': seat.pk,
        'name': seat.seat,
        'chief_seat_name': seat.chief.seat if seat.chief else 'Посаду начальника не внесено в базу'
    } for seat in Seat.objects
        .filter(department_id=dep_id)
        .filter(is_active=True)
        .order_by('seat')]
    return seats


# Функція, яка повертає посаду керівника відділу
@try_except
def get_dep_chief_id(emp_seat_id):
    # Відділ автора документу:
    authors_dep = Employee_Seat.objects.values_list('seat__department_id', flat=True).filter(id=emp_seat_id)[0]

    # Посада начальника відділу:
    dep_chief_id = Seat.objects.values_list('id', flat=True).filter(
        department_id=authors_dep).filter(is_dep_chief=True).filter(is_active=True)

    if dep_chief_id:  # В БД може не бути запису, хто керівник відділу
        # Активна людино-посада безпосереднього керівника:
        dep_chief_emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
            .filter(seat_id=dep_chief_id[0]).filter(is_main=True).filter(is_active=True)

        if dep_chief_emp_seat_id:
            return dep_chief_emp_seat_id[0]
    return None


# Повертає ід і назву посади начальника відділу
@try_except
def get_dep_chief(dep_id):
    dep_chief = Seat.objects \
        .filter(department_id=dep_id) \
        .filter(is_dep_chief=True) \
        .filter(is_active=True)
    if dep_chief:
        id = dep_chief[0].pk
        name = dep_chief[0].seat
        return {'id': id, 'name': name}
    return None


# Функція, яка повертає посаду безпосереднього керівника людинопосади
@try_except
def get_chief_id(emp_seat_id):
    # Посада людинопосади:
    seat_id = Employee_Seat.objects.values_list('seat_id', flat=True).filter(id=emp_seat_id)[0]
    chief_id = Seat.objects.values_list('chief_id', flat=True).filter(id=seat_id)

    if chief_id:  # В БД може не бути запису, хто керівник відділу
        # Активна людино-посада безпосереднього керівника:
        chief_emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
            .filter(seat_id=chief_id[0]).filter(is_active=True)

        if chief_emp_seat_id:
            return chief_emp_seat_id[0]

    return 0


# Функція, яка вертає список модулів, що використовуються даним типом документу
@try_except
def get_doc_type_modules(doc_type):
    doc_type_modules_query = Document_Type_Module.objects.filter(document_type_id=doc_type) \
        .filter(is_active=True).order_by('queue')

    if not testing:
        doc_type_modules_query = doc_type_modules_query.filter(testing=False)

    doc_type_modules = [{
        'id': type_module.id,
        'module': type_module.module.module,
        'module_id': type_module.module_id,
        'field_name': None if type_module.field_name is None else type_module.field_name,
        'field': None if type_module.field is None else type_module.field,
        'required': type_module.required,
        'queue': type_module.queue,
        'additional_info': type_module.additional_info,
        'hide': type_module.hide,
        'doc_type_version': type_module.doc_type_version_id if type_module.doc_type_version else 0,
        'defines_doc_version': type_module.defines_doc_version,
        'columns': type_module.columns if type_module.columns else 12
    } for type_module in doc_type_modules_query]

    return doc_type_modules


@try_except
def get_auto_recipients(doc_type_id):
    # if doc_type_id == '20':
    #     recipients = get_contract_recipients()
    # else:
    doc_type_phases = Doc_Type_Phase.objects \
        .filter(document_type=doc_type_id) \
        .filter(mark_id__in=[2, 6, 8, 11, 17, 23, 24]) \
        .filter(is_active=True)

    if not doc_type_phases:
        return []

    recipients = []

    if not testing:
        doc_type_phases = doc_type_phases.filter(testing=False)

    for dtp in doc_type_phases:

        phase_recipients = {
            'mark': dtp.mark.mark,
            'recipients': [],
            'sole': dtp.sole,
            'doc_type_version': dtp.doc_type_version_id if dtp.doc_type_version else 0
        }

        if dtp.plus_approval_by_chief:
            phase_recipients['recipients'].append({
                'emp_seat': 'Ваш безпосередній начальник',
                'doc_type_version': 0
            })

        phase_recipients_with_doc_type_version = get_phase_recipients_and_doc_type_version(dtp)

        if phase_recipients_with_doc_type_version:
            for pr in phase_recipients_with_doc_type_version:
                phase_recipients['recipients'].append(pr)
            recipients.append(phase_recipients)

    return recipients


@try_except
def get_contract_recipients():
    recipients = [
        {
            'mark': 'Віза',
            'recipients': [],
            'sole': False,
            'doc_type_version': 0
        }, {
            'mark': 'Погоджено',
            'recipients': [],
            'sole': False,
            'doc_type_version': 0
        },
    ]
    return []


# Функція, яка дописує у doc_request інформацію про автора документа, автора позначки,
# назву типу документа і назву позначки для оформлення електронних листів отримувачам
@try_except
def get_additional_doc_info(doc_request):
    document_info = Document.objects \
        .values(
        'employee_seat_id',
        'employee_seat__employee__pip',
        'document_type',
        'document_type__description',
        'document_type__meta_doc_type_id'
    ) \
        .filter(id=doc_request['document'])[0]

    # doc_type_name = Document_Type.objects.values_list('description', flat=True).filter(id=doc_request['document_type'])[0]

    doc_request.update({
        'doc_author_id': document_info['employee_seat_id'],
        'doc_author_name': document_info['employee_seat__employee__pip'],
        'document_type': document_info['document_type'],
        'doc_type_name': document_info['document_type__description'],
        'doc_meta_type_id': document_info['document_type__meta_doc_type_id'],
    })

    # doc_author_name = Document.objects.values_list('employee_seat__employee__pip', flat=True).filter(id=doc_request['document'])[0]
    # doc_request.update({
    #     'doc_type_name': doc_type_name,
    #     'doc_author_name': doc_author_name
    # })

    # doc_type = Document.objects.values_list('document_type', flat=True).filter(id=doc_request['document'])[0]
    # doc_request.update({'document_type': doc_type})

    # doc_author = Document.objects.values_list('employee_seat_id', flat=True).filter(id=doc_request['document'])[0]
    # doc_request.update({'doc_author_id': doc_author})

    if 'mark' in doc_request.keys():
        mark_name = Mark.objects.values_list('mark', flat=True).filter(id=doc_request['mark'])[0]
        mark_author_name = \
        Employee_Seat.objects.values_list('employee__pip', flat=True).filter(id=doc_request['employee_seat'])[0]
        doc_request.update({
            'mark_name': mark_name,
            'mark_author_name': mark_author_name,
        })
    return doc_request


# Знаходить, яка людино-посада на даний час займає цю посаду або її в.о.
@try_except
def get_actual_emp_seat_from_seat(seat_id):
    emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
        .filter(seat_id=seat_id).filter(is_active=True)
    if emp_seat_id:
        emp_seat_id = vacation_check(emp_seat_id[0])
        return emp_seat_id


# Знаходить список працівників, які займають визначену посаду
@try_except
def get_employees_by_seat(seat_id):
    emp_seats = Employee_Seat.objects \
        .filter(seat_id=seat_id) \
        .filter(is_active=True)
    if emp_seats:
        emp_seats = [{
            'id': emp_seat.id,
            'name': emp_seat.employee.pip + (' (в.о)' if not emp_seat.is_main else '')
        } for emp_seat in emp_seats]
        return list(emp_seats)
    return []


@try_except
def get_phase_recipient_list(phase_id, doc_type_version=0):
    recipients = Doc_Type_Phase_Queue.objects \
        .filter(phase_id=phase_id) \
        .filter(is_active=True) \
        .order_by('queue')

    if doc_type_version != 0:
        recipients = recipients.filter(doc_type_version=doc_type_version) \
                     | recipients.filter(doc_type_version='') \
                     | recipients.filter(doc_type_version__isnull=True)

    recipients = [{
        'seat_id': item.seat_id,
        'employee_seat_id': item.employee_seat_id
    } for item in recipients]

    recipients_emp_seat_list = []
    for recipient in recipients:
        if recipient['seat_id']:
            recipients_emp_seat_list.append(get_actual_emp_seat_from_seat(recipient['seat_id']))
        elif recipient['employee_seat_id']:
            recipients_emp_seat_list.append(int(recipient['employee_seat_id']))

    return recipients_emp_seat_list


@try_except
def get_phase_recipients_and_doc_type_version(phase):
    if phase.mark.mark == 'Не заперечую':
        return [{
            'emp_seat': 'Безпосередній начальник автора',
            'doc_type_version': int(phase.doc_type_version_id) if phase.doc_type_version else 0,
        }]

    phase_recipients = Doc_Type_Phase_Queue.objects \
        .filter(phase_id=phase.id) \
        .filter(is_active=True) \
        .order_by('queue')

    phase_recipients = [{
        'seat_id': item.seat_id,
        'employee_seat_id': item.employee_seat_id,
        'doc_type_version': int(item.doc_type_version) if item.doc_type_version
        else int(item.phase.doc_type_version_id) if item.phase.doc_type_version else 0,
    } for item in phase_recipients]

    recipients = []
    for recipient in phase_recipients:
        seat = recipient['seat_id']

        if recipient['seat_id']:
            emp_seat_id = get_actual_emp_seat_from_seat(recipient['seat_id'])
        else:
            emp_seat_id = recipient['employee_seat_id']

        employee_seat = Employee_Seat.objects.filter(id=emp_seat_id)[0]
        employee_seat_info = employee_seat.employee.pip + ', ' + employee_seat.seat.seat

        recipients.append({
            'emp_seat': employee_seat_info,
            'doc_type_version': recipient['doc_type_version'],
        })

    return recipients


# Повертає ід фази 0 (створення) типу документу
@try_except
def get_zero_phase_id(document_type):
    return Doc_Type_Phase.objects.values_list('id', flat=True) \
        .filter(document_type_id=document_type) \
        .filter(phase=0) \
        .filter(is_active=True)[0]


# Повертає простий список ід посад, які мають бути отримувачами в наступній фазі
# Перевіряє, чи це фаза sole чи ні.
# Sole - це коли зі списку отримувачів потрібно надіслати документ тільки одному:
# найближчому керівнику (н-д у випадку звільнюючої).
@try_except
def get_phase_id_sole_recipients(phase_id, emp_seat, doc_type_version=0):
    recipients = get_phase_recipient_list(phase_id, doc_type_version)

    sole = Doc_Type_Phase.objects.values_list('sole', flat=True).filter(id=phase_id)[0]
    if sole:
        chief_seat_id = Employee_Seat.objects.values_list('seat__chief_id', flat=True).filter(id=emp_seat).filter(
            is_active=True)
        if chief_seat_id:  # False якщо у посади нема внесеного шефа
            chief_emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
                .filter(seat_id=chief_seat_id[0]).filter(is_main=True).filter(is_active=True)[0]

            chief_emp_seat_id = vacation_check(chief_emp_seat_id)

            while chief_emp_seat_id not in recipients:
                chief_seat_id = Employee_Seat.objects.values_list('seat__chief_id', flat=True).filter(
                    id=chief_emp_seat_id).filter(is_active=True)
                if chief_seat_id:  # False якщо у посади нема внесеного шефа
                    chief_emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
                        .filter(seat_id=chief_seat_id[0]).filter(is_main=True).filter(is_active=True)[0]
                    chief_emp_seat_id = vacation_check(chief_emp_seat_id)

            return [chief_emp_seat_id]
    else:
        return recipients


@try_except
def get_all_subs_docs(emp_seat):
    # Отримуємо ід посади з ід людинопосади
    seat_id = Employee_Seat.objects.filter(id=emp_seat).values_list('seat_id')[0][0]

    # Список всіх підлеглих користувача:
    subs_list = get_sub_seats(int(seat_id))

    # Шукаємо документи кожного підлеглого
    subs = []
    if subs_list:
        for sub in subs_list:
            subs.append(sub['id'])

        docs_from_path = [{
            'id': path.document_id,
            'type': path.document.document_type.description,
            'date': datetime.strftime(path.timestamp, '%d.%m.%Y'),
            'author': path.employee_seat.employee.pip,
            'is_active': path.document.is_active,
            'main_field': path.document.main_field,
        } for path in Document_Path.objects
            .filter(mark_id=1)
            .filter(employee_seat__seat_id__in=subs)
            .filter(document__testing=testing)
            .filter(document__closed=False)]

        docs_from_nark_demand = [{
            'id': md.document_id,
            'type': md.document.document_type.description,
            'date': datetime.strftime(md.document_path.timestamp, '%d.%m.%Y'),
            'author': md.document_path.employee_seat.employee.pip,
            'is_active': md.document.is_active,
            'main_field': md.document.main_field,
        } for md in Mark_Demand.objects
            .filter(recipient__seat_id__in=subs)
            .filter(document__testing=testing)
            .filter(document__closed=False)]

        docs = docs_from_path + docs_from_nark_demand
        docs = [dict(t) for t in {tuple(d.items()) for d in docs}]  # Видаляємо дублікати

        return docs


@try_except
def get_emp_seat_docs(emp_seat, sub_emp):
    docs_from_path = [{
        'id': path.document_id,
        'type': path.document.document_type.description,
        'date': datetime.strftime(path.timestamp, '%d.%m.%Y'),
        'author': path.employee_seat.employee.pip,
        'is_active': path.document.is_active,
        'main_field': path.document.main_field,
    } for path in Document_Path.objects
        .filter(mark_id=1)
        .filter(employee_seat_id=sub_emp)
        .filter(document__testing=testing)
        .filter(document__closed=False)]

    docs_from_nark_demand = [{
        'id': md.document_id,
        'type': md.document.document_type.description,
        'date': datetime.strftime(md.document_path.timestamp, '%d.%m.%Y'),
        'author': md.document_path.employee_seat.employee.pip,
        'is_active': md.document.is_active,
        'main_field': md.document.main_field,
    } for md in Mark_Demand.objects
        .filter(recipient=sub_emp)
        .filter(document__testing=testing)
        .filter(document__closed=False)]

    docs = docs_from_path + docs_from_nark_demand
    docs = [dict(t) for t in {tuple(d.items()) for d in docs}]  # Видаляємо дублікати

    return docs


@try_except
def get_emp_seat_and_doc_type_docs(emp_seat, sub_emp, doc_meta_type):
    docs_from_path = [{
        'id': path.document_id,
        'type': path.document.document_type.description,
        'date': datetime.strftime(path.timestamp, '%d.%m.%Y'),
        'author': path.employee_seat.employee.pip,
        'is_active': path.document.is_active,
        'main_field': path.document.main_field,
    } for path in Document_Path.objects
        .filter(mark_id=1)
        .filter(document__document_type__meta_doc_type=doc_meta_type)
        .filter(employee_seat_id=sub_emp)
        .filter(document__testing=testing)
        .filter(document__closed=False)]

    docs_from_mark_demand = [{
        'id': md.document_id,
        'type': md.document.document_type.description,
        'date': datetime.strftime(md.document_path.timestamp, '%d.%m.%Y'),
        'author': md.document_path.employee_seat.employee.pip,
        'is_active': md.document.is_active,
        'main_field': md.document.main_field,
    } for md in Mark_Demand.objects
        .filter(document__document_type__meta_doc_type=doc_meta_type)
        .filter(recipient=sub_emp)
        .filter(document__testing=testing)
        .filter(document__closed=False)
        .exclude(document__employee_seat_id=sub_emp)]

    docs = docs_from_path + docs_from_mark_demand
    docs = [dict(t) for t in {tuple(d.items()) for d in docs}]  # Видаляємо дублікати

    return docs


@try_except
def get_doc_type_docs(emp_seat, doc_meta_type):
    # Отримуємо ід посади з ід людинопосади
    seat_id = Employee_Seat.objects.filter(id=emp_seat).values_list('seat_id')[0][0]

    # Список всіх підлеглих користувача:
    subs_list = get_sub_seats(int(seat_id))

    # Шукаємо документи кожного підлеглого
    subs = []
    if subs_list:
        for sub in subs_list:
            subs.append(sub['id'])

        docs_from_path = [{
            'id': path.document_id,
            'type': path.document.document_type.description,
            'date': datetime.strftime(path.timestamp, '%d.%m.%Y'),
            'author': path.employee_seat.employee.pip,
            'is_active': path.document.is_active,
            'main_field': path.document.main_field,
        } for path in Document_Path.objects
            .filter(mark_id=1)
            .filter(employee_seat__seat_id__in=subs)
            .filter(document__document_type__meta_doc_type_id=doc_meta_type)
            .filter(document__testing=testing)
            .filter(document__closed=False)]

        docs_from_mark_demand = [{
            'id': md.document_id,
            'type': md.document.document_type.description,
            'date': datetime.strftime(md.document_path.timestamp, '%d.%m.%Y'),
            'author': md.document_path.employee_seat.employee.pip,
            'is_active': md.document.is_active,
            'main_field': md.document.main_field,
        } for md in Mark_Demand.objects
            .filter(document__document_type__meta_doc_type_id=doc_meta_type)
            .exclude(document__employee_seat__seat_id__in=subs)
            .filter(recipient__seat_id__in=subs)
            .filter(document__testing=testing)
            .filter(document__closed=False)]

        docs = docs_from_path + docs_from_mark_demand
        docs = [dict(t) for t in {tuple(d.items()) for d in docs}]  # Видаляємо дублікати

        # existing_ids = []
        # docs_filtered = []
        #
        # for i in range(len(docs_from_mark_demand)):
        #     if docs_from_mark_demand[i]['id'] not in existing_ids:
        #         docs_from_mark_demand_filtered.append(docs_from_mark_demand[i])
        #         existing_ids.append(docs_from_mark_demand[i]['id'])

        return docs


@try_except
def get_delegated_docs(emp, sub=0, doc_meta_type=0):
    docs = Mark_Demand.objects \
        .filter(document__testing=testing) \
        .filter(document__closed=False) \
        .filter(delegated_from_id=emp)

    if sub != '0':
        docs = docs.filter(recipient=sub)
    else:
        seat = Employee_Seat.objects.values_list('seat_id', flat=True).filter(id=emp)[0]
        subs = get_sub_emps(seat, True)
        subs = [sub['id'] for sub in subs]
        docs = docs.filter(recipient__in=subs)

    if doc_meta_type != '0':
        docs = docs.filter(document__document_type__meta_doc_type=doc_meta_type)

    docs_list = [{
        'id': md.document_id,
        'type': md.document.document_type.description,
        'date': datetime.strftime(md.document_path.timestamp, '%d.%m.%Y'),
        'author': md.document_path.employee_seat.employee.pip,
        'md_is_active': md.is_active,
        'main_field': md.document.main_field,
    } for md in docs]

    return docs_list


@try_except
def get_doc_modules(doc, responsible_id=0):
    doc_modules = {}

    type_modules = [{
        'module': type_module.module.module,
        'field_name': None if type_module.field_name is None else type_module.field_name,
        'is_editable': type_module.is_editable,
        'queue': type_module.queue,
        'doc_type_version': type_module.doc_type_version_id,
        'additional_info': type_module.additional_info  # for showing in non-editable module
    } for type_module in Document_Type_Module.objects
        .filter(document_type_id=doc.document_type_id)
        .filter(is_active=True)
        .order_by('queue')]
    doc_modules.update({
        'type_modules': type_modules,
    })

    # збираємо з використовуваних модулів інфу про документ
    for module in type_modules:
        if module['module'] in ['text', 'dimensions', 'packaging_type', 'select']:
            # Шукаємо список текстових полів тільки для першого текстового модуля, щоб не брати ту ж інфу ще раз
            if 'text_list' not in doc_modules.keys():
                text_list = [{
                    'queue': item.queue_in_doc,
                    'text': item.text if item.text else '---'}
                    for item in Doc_Text.objects.filter(document_id=doc.id).filter(is_active=True)]
                doc_modules.update({
                    'text_list': text_list,
                })

        elif module['module'] == 'integer':
            doc_modules.update({'integer': get_integer(doc.id)})

        elif module['module'] == 'decimal':
            doc_modules.update({'decimal': get_decimal(doc.id)})

        elif module['module'] == 'boolean':
            doc_modules.update({'booleans': get_booleans(doc.id, doc.document_type_id)})

        elif module['module'] == 'dep_seat':
            doc_modules.update({'dep_seat': get_seat(doc.id)})

        elif module['module'] == 'recipient':
            recipient = [{
                'id': item.recipient.id,
                'name': item.recipient.employee.pip,
                'seat': item.recipient.seat.seat
                if item.recipient.is_main
                else '(в.о.) ' + item.recipient.seat.seat,
            } for item in Doc_Recipient.objects.filter(document_id=doc.id).filter(is_active=True)]

            if recipient:
                doc_modules.update({
                    'recipient': {
                        'id': recipient[0]['id'],
                        'name': recipient[0]['name'],
                        'seat': recipient[0]['seat'],
                    }
                })

        elif module['module'] == 'recipient_chief':
            recipient_chief = [{
                'id': item.recipient.id,
                'name': item.recipient.employee.pip,
                'seat': item.recipient.seat.seat
                if item.recipient.is_main
                else '(в.о.) ' + item.recipient.seat.seat,
            } for item in Doc_Recipient.objects.filter(document_id=doc.id).filter(is_active=True)]

            if recipient_chief:
                doc_modules.update({
                    'recipient_chief': {
                        'id': recipient_chief[0]['id'],
                        'name': recipient_chief[0]['name'],
                        'seat': recipient_chief[0]['seat'],
                    }
                })

        elif module['module'] == 'acquaint_list':
            acquaint_list = [{
                'id': item.acquaint_emp_seat.id,
                'emp_seat': item.acquaint_emp_seat.employee.pip + ', ' + item.acquaint_emp_seat.seat.seat,
            } for item in Doc_Acquaint.objects.filter(document_id=doc.id).filter(is_active=True)]
            doc_modules.update({'acquaint_list': acquaint_list})

        elif module['module'] == 'approval_list':
            approval_list = [{
                'id': item.id,
                'emp_seat_id': item.emp_seat.id,
                'emp_seat': item.emp_seat.employee.pip + ', ' + item.emp_seat.seat.seat + get_acting_flag(
                    item.emp_seat.is_main),
                'approved': True if item.approved else False,
                'approved_date': convert_to_localtime(item.approve_path.timestamp, 'day') if item.approved else None,
                'approve_queue': item.approve_queue,
                'comment': item.approve_path.comment if item.approve_path else '',
            } for item in
                Doc_Approval.objects.filter(document_id=doc.id).filter(is_active=True).order_by('-approve_queue')]

            # Лише для договорів та тендерів
            changeable = doc.document_type.meta_doc_type_id in [5, 9] \
                         and are_approvals_on_first_phase(approval_list) \
                         and int(responsible_id) == doc.employee_seat_id

            doc_modules.update({'approval_list': approval_list, 'approvals_changeable': changeable})

        elif module['module'] == 'files':
            files = [{
                'id': file.id,
                'file': file.file.name,
                'name': file.name,
                'path_id': file.document_path.id,
                'mark_id': file.document_path.mark.id,
                'first_path': file.first_path,
                'version': file.version,
                'status': ''  # Для таблиці в компоненті EditFiles
            } for file in File.objects
                .filter(document_path__document_id=doc.id)
                # .filter(Q(document_path__mark=1) | Q(document_path__mark=16))
                .filter(is_active=True)]
            doc_modules.update({'old_files': files})

        elif module['module'] == 'day':
            # Шукаємо список дат тільки для першого модуля, щоб не брати ту ж інфу ще раз
            if 'days' not in doc_modules.keys():
                days = [{
                    'queue': item.queue_in_doc,
                    'day': date_to_json(item.day)
                } for item in Doc_Day.objects.filter(document_id=doc.id).filter(is_active=True)]
                doc_modules.update({
                    'days': days,
                })
        elif module['module'] == 'foyer_ranges':
            if 'foyer_ranges' not in doc_modules.keys():
                doc_modules.update({'foyer_ranges': get_foyer_ranges(doc.id), })
        elif module['module'] == 'gate':
            gate = [{
                'gate': item.gate,
            } for item in Doc_Gate.objects.filter(document_id=doc.id).filter(is_active=True)]

            if gate:
                doc_modules.update({'gate': gate[0]['gate']})

        elif module['module'] == 'carry_out_items':
            items = [{
                'id': item.id,
                'item_name': item.item_name,
                'quantity': item.quantity,
                'measurement': item.measurement,
            } for item in Carry_Out_Items.objects.filter(document_id=doc.id)]

            if items:
                # Індексуємо список товарів, щоб id товарів не бралися з таблиці а створювалися з 1
                items_indexed = [{
                    'id': items.index(item) + 1,
                    'item_name': item['item_name'],
                    'quantity': item['quantity'],
                    'measurement': item['measurement'],
                } for item in items]

                doc_modules.update({'carry_out_items': items_indexed})

        elif module['module'] == 'mockup_type':
            mockup_type = [{
                'id': item.mockup_type.id,
                'name': item.mockup_type.name,
            } for item in Doc_Mockup_Type.objects.all()
                .filter(document_id=doc.id)
                .filter(is_active=True)]

            if mockup_type:
                doc_modules.update({
                    'mockup_type': {
                        'id': mockup_type[0]['id'],
                        'name': mockup_type[0]['name']}
                })

        elif module['module'] == 'mockup_product_type':
            mockup_product_type = [{
                'id': item.mockup_product_type.id,
                'name': item.mockup_product_type.name,
            } for item in Doc_Mockup_Product_Type.objects.all()
                .filter(document_id=doc.id)
                .filter(is_active=True)]

            if mockup_product_type:
                doc_modules.update({
                    'mockup_product_type': {
                        'id': mockup_product_type[0]['id'],
                        'name': mockup_product_type[0]['name']}
                })
        elif module['module'] == 'product_type_sell':
            sub_product = [{
                'id': item.sub_product_type_id,
                'sub_product': item.sub_product_type.name,
                'product': item.sub_product_type.type.name,
                'product_id': item.sub_product_type.type_id,
            } for item in Doc_Sub_Product.objects
                .filter(document_id=doc.id)
                .filter(is_active=True)]

            if sub_product:
                doc_modules.update({
                    'sub_product': {
                        'id': sub_product[0]['id'],
                        'sub_product': sub_product[0]['sub_product'],
                        'product': sub_product[0]['product'],
                        'product_id': sub_product[0]['product_id']}
                })
        elif module['module'] == 'scope':
            scope = [{
                'id': item.scope.id,
                'name': item.scope.name,
            } for item in Doc_Scope.objects
                .filter(document_id=doc.id)
                .filter(is_active=True)]

            if scope:
                doc_modules.update({
                    'scope': {
                        'id': scope[0]['id'],
                        'name': scope[0]['name']}
                })
        elif module['module'] == 'law':
            law = [{
                'id': item.law.id,
                'name': item.law.name,
            } for item in Doc_Law.objects
                .filter(document_id=doc.id)
                .filter(is_active=True)]

            if law:
                doc_modules.update({
                    'law': {
                        'id': law[0]['id'],
                        'name': law[0]['name']}
                })
        elif module['module'] == 'client':
            client = [{
                'id': item.counterparty.id,
                'name': item.counterparty.name,
                'country': item.counterparty.country,
            } for item in Doc_Counterparty.objects.all()
                .filter(document_id=doc.id)
                .filter(is_active=True)]

            if client:
                doc_modules.update({
                    'client': {
                        'id': client[0]['id'],
                        'name': client[0]['name'],
                        'country': client[0]['country']
                    }})

        elif module['module'] == 'counterparty':
            counterparty = [{
                'id': item.counterparty.id if item.counterparty else 0,
                'name': item.counterparty.name if item.counterparty else '',
                'country': item.counterparty.country if item.counterparty else '',
                'input': item.counterparty_input or ''
            } for item in Doc_Counterparty.objects.all()
                .filter(document_id=doc.id)
                .filter(is_active=True)]

            if counterparty:
                if counterparty[0]['id'] != 0:
                    doc_modules.update({
                        'counterparty': {
                            'id': counterparty[0]['id'],
                            'name': (counterparty[0]['name'] + ', ' + counterparty[0]['country'])
                            if counterparty[0]['country']
                            else counterparty[0]['name']
                        }})
                else:
                    doc_modules.update({
                        'counterparty': {
                            'id': counterparty[0]['id'],
                            'name': counterparty[0]['input'],
                        }})

        elif module['module'] == 'contract_link':
            contract_link_id = Doc_Contract.objects.values_list('contract_id', flat=True) \
                .filter(document_id=doc.id) \
                .filter(is_active=True)

            if contract_link_id:
                contract = [{
                    'subject': item.subject,
                    'number': item.number if item.number else '',
                } for item in Contract.objects
                    .filter(id=contract_link_id[0])]
                doc_modules.update({'contract_link': {
                    'id': contract_link_id[0],
                    'subject': contract[0]['subject'],
                    'number': contract[0]['number']
                }})
            else:
                doc_modules.update({'contract_link': {'id': 0}})

        elif module['module'] == 'choose_company':
            # company = Document.objects.values_list('company', flat=True).filter(id=doc.id)[0]
            doc_modules.update({'company': doc.company})

        elif module['module'] == 'stage':
            doc_modules.update({'stage': doc.stage})

        elif module['module'] == 'client_requirements':
            cr = Client_Requirements.objects.filter(document=doc).filter(is_active=True)
            data = serializers.serialize("json", cr)
            data = json.loads(data)

            ar = [{
                'id': ar.id,
                'name': ar.name,
                'requirement': ar.requirement,
                'status': 'old'
            } for ar in Client_Requirement_Additional.objects.filter(client_requirements_id=data[0]['pk']).filter(is_active=True)]

            doc_modules.update({'client_requirements': data[0]['fields']})
            doc_modules.update({'additional_requirements': ar})

        elif module['module'] == 'employee':
            employee = [{
                'id': employee.employee_id,
                'name': employee.employee.pip + ', ' + employee.employee.tab_number,
            } for employee in Doc_Employee.objects
                .filter(document_id=doc.id)
                .filter(queue_in_doc=module['queue'])
                .filter(is_active=True)]

            doc_modules.update({'employee': employee[0]})

        elif module['module'] == 'document_link':
            dl = Doc_Doc_Link.objects.values_list('document_link_id', flat=True) \
                .filter(module_id=39) \
                .filter(document=doc).filter(is_active=True)
            if dl:
                dl_id = dl[0]
                dl = get_object_or_404(Document, pk=dl_id)
                doc_modules.update({'document_link': {'id': dl_id, 'main_field': dl.main_field}})

        elif module['module'] == 'client_requirements_choose':
            dl = Doc_Doc_Link.objects.values_list('document_link_id', flat=True)\
                .filter(module_id=47)\
                .filter(document=doc).filter(is_active=True)
            if dl:
                dl_id = dl[0]
                dl = get_object_or_404(Document, pk=dl_id)
                doc_modules.update({'client_requirements_choose': {'id': dl_id, 'main_field': dl.main_field}})

        elif module['module'] == 'registration':
            registration_number = Doc_Registration.objects.values_list('registration_number', flat=True) \
                .filter(document_id=doc.id) \
                .filter(is_active=True)

            doc_modules.update({'registration_number': registration_number[0] if registration_number else ''})

        elif module['module'] == 'cost_rates':
            doc_modules.update({'cost_rates': get_cost_rates(doc.id)})

        elif module['module'] == 'contract_subject':
            doc_modules = get_contract_subject(doc_modules, doc.id)

        elif module['module'] == 'deadline':
            doc_modules.update({'deadline': get_deadline(doc)})

        elif module['module'] == 'employee_seat':
            doc_modules.update({'employee_seat': get_employee_seat(doc)})

        elif module['module'] == 'decree_articles':
            doc_modules.update({'decree_articles': get_decree_articles(doc)})

        elif module['module'] == 'bag_test':
            doc_modules.update({'bag_test': get_bag_test_fields(doc.id)})

        # doc_type_version module підтягуємо для всіх документів
        dtv = {
            'id': doc.doc_type_version_id,
            'name': doc.doc_type_version.description if doc.doc_type_version else ''
        }

        doc_modules.update({'doc_type_version': dtv})

    return doc_modules


@try_except
def is_mark_demand_exists(emp_seat_id, document_id):
    return Mark_Demand.objects \
        .filter(recipient_id=emp_seat_id) \
        .filter(document_id=document_id) \
        .filter(is_active=True) \
        .exists()


@try_except
def is_already_approved(document_id, emp_seat_id):
    is_approved = Doc_Approval.objects.values_list('approved', flat=True) \
        .filter(document_id=document_id) \
        .filter(emp_seat_id=emp_seat_id)[0]
    if is_approved:
        return is_approved[0]
    return False


@try_except
def get_main_field(document):  # Знаходимо значення main_field для запису у новостворений документ
    main_field_data = Document_Type_Module.objects.values('module_id', 'module__module', 'queue') \
        .filter(document_type_id=document.document_type_id) \
        .filter(is_main_field=True)[0]

    main_field = []

    if main_field_data['module_id'] == 16:  # Текст
        main_field = Doc_Text.objects.values_list('text', flat=True) \
            .filter(document=document) \
            .filter(queue_in_doc=main_field_data['queue']) \
            .filter(is_active=True)
    elif main_field_data['module_id'] == 26:  # Клієнт
        main_field = Doc_Counterparty.objects.values_list('counterparty__name', flat=True) \
            .filter(document=document) \
            .filter(is_active=True)
    elif main_field_data['module_id'] == 34:  # Контрагент
        doc_counterparty = [{
            'name': dc.counterparty.name if dc.counterparty else '',
            'input': dc.counterparty_input
        } for dc in Doc_Counterparty.objects
            .filter(document=document)
            .filter(is_active=True)]

        if doc_counterparty:
            if doc_counterparty[0]['name'] != '':
                return doc_counterparty[0]['name']
            else:
                return doc_counterparty[0]['input']
    elif main_field_data['module_id'] == 42:  # Версія документа
        main_field = [document.doc_type_version.description if document.doc_type_version else '']
    elif main_field_data['module__module'] == 'cost_rates':  # Норми витрат
        cost_rates = get_object_or_404(Cost_Rates, document=document)
        main_field = [cost_rates.product.name]
    elif main_field_data['module__module'] == 'bag_test':  # Тестування упаковки
        bag_test = get_object_or_404(Bag_Test, document=document)
        main_field = [bag_test.client.name]

    if len(main_field) > 0:
        return main_field[0]
    return ''


@try_except
def get_supervisors(doc_type):
    meta_doc_type = Document_Type.objects.values_list('meta_doc_type', flat=True).filter(id=doc_type)[0]
    supervisors = [{
        'emp_id': item.employee.id,
        'mail': item.employee.user.email,
    } for item in User_Doc_Type_View.objects \
        .filter(meta_doc_type_id=meta_doc_type) \
        .filter(send_mails=True) \
        .filter(is_active=True)]
    if supervisors:
        return supervisors
    return []


@try_except
def get_allowed_new_doc_types(request):
    # Документи, які можна створювати всім, не мають записів у таблиці edms_doc_type_create_rights
    free_doc_types = Document_Type.objects \
        .filter(is_active=True) \
        .filter(~Exists(Doc_Type_Create_Rights.objects
                        .filter(is_active=True)
                        .filter(document_meta_type=OuterRef('meta_doc_type'))))

    # Права відділу, до якого відноситься UserProfile
    dep_doc_types = Document_Type.objects \
        .filter(is_active=True) \
        .filter(Exists(Doc_Type_Create_Rights.objects
                       .filter(document_meta_type=OuterRef('meta_doc_type'))
                       .filter(department=request.user.userprofile.department)))

    if not testing:
        free_doc_types = free_doc_types.filter(testing=False)
        dep_doc_types = dep_doc_types.filter(testing=False)

    doc_types = free_doc_types.union(dep_doc_types)  \
        .order_by('description')

    return [{  # Список документів, які може створити юзер
        'id': doc_type.id,
        'description': doc_type.description,
    } for doc_type in doc_types]  # В режимі тестування показуються типи документів, що тестуються

    # Права відділу, до якого відноситься конкретна посада (може і не треба?)
    # Права конкретної посади
    # Права конкретної людино-посади


@try_except
def get_mark_name(mark, mark_id, meta_doc_type_id):
    if mark_id == 3 and meta_doc_type_id == 5:
        return 'Запит на зміни'
    elif mark_id == 25:
        return 'Делеговано підлеглому'
    elif mark_id == 26:
        return 'Деактивовано'
    return mark


@try_except
def get_doc_path(meta_doc_type_id, doc_id):
    return [{
        'id': path.id,
        'time': convert_to_localtime(path.timestamp, 'time'),
        'mark_id': path.mark_id,
        'mark': get_mark_name(path.mark.mark, path.mark_id, meta_doc_type_id),
        # 'mark': path.mark.mark,
        'emp_seat_id': path.employee_seat_id,
        'emp': path.employee_seat.employee.pip,
        'seat': path.employee_seat.seat.seat if path.employee_seat.is_main else '(в.о.) ' + path.employee_seat.seat.seat,
        'comment': path.comment,
        'original_path': path.path_to_answer_id,
    } for path in Document_Path.objects.filter(document_id=doc_id).order_by('-timestamp')]


@try_except
def get_path_steps(path):
    for step in path:
        # Шукаємо резолюції та "на ознайомлення" і додаємо їх до запису в path
        if step['mark_id'] == 10:
            resolutions = [{
                'id': md.id,
                'emp_seat_id': md.recipient.id,
                'emp_seat': md.recipient.employee.pip + ', ' + md.recipient.seat.seat,
                'comment': md.comment,
            } for md in Mark_Demand.objects.filter(document_path_id=step['id'])]
            step['resolutions'] = resolutions
        if step['mark_id'] == 15:
            acquaints = [{
                'id': md.id,
                'emp_seat_id': md.recipient.id,
                'emp_seat': md.recipient.employee.pip + ', ' + md.recipient.seat.seat,
            } for md in Mark_Demand.objects.filter(document_path_id=step['id'])]
            step['acquaints'] = acquaints

        # Шукаємо додані файли і додаємо їх до відповідного запису в path
        files = [{
            'id': file.id,
            'file': file.file.name,
            'name': file.name,
            'path_id': file.document_path.id,
            'mark_id': file.document_path.mark.id,
            'version': file.version,
        } for file in File.objects.filter(document_path_id=step['id'])]
        step['files'] = files

        # Шукаємо видалені файли і додаємо їх до відповідного запису в path
        deactivated_files = [{
            'id': file.id,
            'file': file.file.name,
            'name': file.name,
            'path_id': file.document_path.id,
            'mark_id': file.document_path.mark.id,
            'version': file.version,
        } for file in File.objects.filter(deactivate_path_id=step['id'])]
        step['deactivated_files'] = deactivated_files

    return path


@try_except
def get_doc_flow(doc_id):
    # В кого на черзі документ:
    flow_all = [{
        'id': demand.id,
        'emp_seat_id': demand.recipient.id,
        'emp': demand.recipient.employee.pip,
        'seat': demand.recipient.seat.seat if demand.recipient.is_main else '(в.о.) ' + demand.recipient.seat.seat,
        'expected_mark': demand.mark_id,
    } for demand in Mark_Demand.objects.filter(document_id=doc_id).filter(is_active=True)]

    # Розділяємо чергу на два потоки: "На ознайомлення" та "На черзі у"
    flow = []
    acquaints = []

    for step in flow_all:
        if step['expected_mark'] == 8:
            acquaints.append(step)
        else:
            flow.append(step)

    return {'flow': flow, 'acquaints': acquaints}


@try_except
def is_reg_number_free(reg_number):
    is_taken = Doc_Registration.objects \
        .filter(registration_number=reg_number) \
        .filter(is_active=True) \
        .exists()
    return not is_taken


@try_except
def get_doc_version_from_description_matching(document_type_id, description):
    doc_type_version = Document_Type_Version.objects.values_list('id', flat=True) \
        .filter(document_type_id=document_type_id) \
        .filter(description=description) \
        .filter(is_active=True)[0]
    return doc_type_version


@try_except
def are_approvals_on_first_phase(approvals_list=None):
    if approvals_list is None:
        approvals_list = []
    else:
        for approval in approvals_list:
            if approval['approve_queue'] == 1 and not approval['approved']: return True
        return False


# Перевіряє, чи є на даній фазі невиконані mark_demands
@try_except
def remaining_required_md(doc_id, phase_id):
    count = Mark_Demand.objects \
        .filter(document_id=doc_id) \
        .filter(phase_id=phase_id) \
        .filter(phase__required=True) \
        .filter(is_active=True) \
        .exclude(mark_id=8) \
        .count()
    return count


@try_except
def get_approvals_for_contract_subject(doc_modules):
    if 'contract_subject' in doc_modules and 'id' in doc_modules['contract_subject']:
        approvals_query = Contract_Subject_Approval.objects\
            .filter(subject_id=doc_modules['contract_subject']['id'])\
            .filter(is_active=True)

        approvals_list = [{
            'emp_seat_id': approval.recipient.id,
            'name': approval.recipient.employee.pip
        } for approval in approvals_query]

        return approvals_list
    return []


@try_except
def get_to_work_for_contract_subject(document_id):
    try:
        doc_contract_subject = Doc_Contract_Subject.objects.get(document_id=document_id)

        if doc_contract_subject.contract_subject:
            to_work_query = Contract_Subject_To_Work.objects\
                .filter(subject_id=doc_contract_subject.contract_subject.id)\
                .filter(is_active=True)

            to_works_list = [{
                'id': to_work.recipient.id,
                'name': to_work.recipient.employee.pip
            } for to_work in to_work_query]

            return to_works_list

        return []

    except Doc_Contract_Subject.DoesNotExist:
        return []


@try_except
def get_client_requirements_list(counterparty_id):
    documents_binded_to_counterparty = [
        item.document_id
     for item in Doc_Counterparty.objects
        .filter(counterparty_id=counterparty_id)
        .filter(document__document_type__meta_doc_type_id=11)
        .exclude(document__approved=False)
        .filter(document__is_template=False)
        .filter(document__closed=False)]

    cr_list = [{
        'id': item.id,
        'name': get_doc_sub_product_name(item.id) + ' (погоджено)' if item.approved
            else get_doc_sub_product_name(item.id) + ' (на погодженні)'

    } for item in Document.objects
        .filter(id__in=documents_binded_to_counterparty)]

    return cr_list


@try_except
def get_doc_sub_product_name(doc_id):
    doc_sub_product_name = Doc_Sub_Product.objects\
        .filter(document_id=doc_id).values_list('sub_product_type__name', flat=True).first()
    return doc_sub_product_name

