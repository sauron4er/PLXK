from django.conf import settings
from django.utils.timezone import datetime
from django.db.models import Exists, OuterRef
from plxk.api.try_except import try_except
from plxk.api.convert_to_local_time import convert_to_localtime
from plxk.api.datetime_normalizers import date_to_json
from .vacations import vacation_check
from ..models import *
from docs.models import Contract

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
        phase_id = Doc_Type_Phase.objects.values_list('id', flat=True)\
            .filter(document_type_id=doc_request['document_type'])\
            .filter(phase=0)\
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


# Функція, яка рекурсією шукає всіх підлеглих посади користувача і їх підлеглих
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
def get_sub_emps(seat):
    # Знаходимо підлеглих посади:
    emp_seats = [{
        'id': emp_seat.id,
        'seat': emp_seat.seat.seat,
        'seat_id': emp_seat.seat_id,
        'emp': emp_seat.employee.pip,
    } for emp_seat in Employee_Seat.objects
        .filter(seat__chief_id=seat)
        .filter(employee__is_pc_user=True)
        .filter(is_active=True)]

    temp_emp_seats = []
    if emp_seats:  # якщо підлеглі є:
        for emp_seat in emp_seats:
            temp_emp_seats.append(emp_seat)  # додамо кожного підлеглого у список
            new_seats = get_sub_emps(emp_seat['seat_id'])  # і шукаємо його підлеглих
            if new_seats is not None:  # якщо підлеглі є, додаємо і їх у список
                for new_seat in new_seats:
                    temp_emp_seats.append(new_seat)
        return sorted(temp_emp_seats, key=lambda i: i['emp'])
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
def is_access_granted(user, emp_seat, doc):
    emp_seats = user.userprofile.positions.all().values_list('id', flat=True)

    if doc.employee_seat_id in emp_seats:  # Це автор документу
        return True
    if doc.path.filter(employee_seat__in=emp_seats).exists():  # Мав документ у роботі
        return True
    if doc.document_demands.filter(recipient__in=emp_seats).exists():  # Мав документ у mark_demands
        return True

    # Є дозвіл на перегляд усіх документів цього мета-типу
    is_view_granted = User_Doc_Type_View.objects\
        .filter(employee=user.userprofile)\
        .filter(meta_doc_type=doc.document_type.meta_doc_type)\
        .filter(is_active=True).exists()
    if is_view_granted:
        return True

    # TODO шукати усіх підлеглих усіх посад користувача, зараз шукаються лише підлеглі однієї посади
    my_seat = Employee_Seat.objects.values_list('seat_id', flat=True).filter(id=emp_seat)[0]
    sub_emps = get_sub_emps(my_seat)
    sub_emps_flat = [sub_emp['id'] for sub_emp in sub_emps] if sub_emps else []

    if doc.employee_seat_id in sub_emps_flat:
        return True
    if doc.path.filter(employee_seat__in=sub_emps_flat).exists():
        return True
    if doc.document_demands.filter(recipient__in=sub_emps_flat).exists():
        return True

    return False


@try_except
def get_archive_by_doc_meta_type(user_id, doc_type_id):
    my_archive = [{  # Список документів, створених даним юзером
        'id': path.document.id,
        'type': path.document.document_type.description,
        'type_id': path.document.document_type.id,
        'date': convert_to_localtime(path.timestamp, 'day'),
        'emp_seat_id': path.employee_seat.id,
        'author': path.document.employee_seat.employee.pip,
        'author_seat_id': path.employee_seat.id,
        'main_field': get_main_field(path.document),
    } for path in Document_Path.objects
        .filter(document__document_type__meta_doc_type_id=doc_type_id)
        .filter(mark=1)
        .filter(employee_seat__employee_id=user_id)
        .filter(document__testing=testing)
        .filter(document__closed=False)]

    work_archive_with_duplicates = [{  # Список документів, які були у роботі користувача
        'id': path.document_id,
        'type': path.document.document_type.description,
        'type_id': path.document.document_type_id,
        'date': convert_to_localtime(path.document.date, 'day'),
        'emp_seat_id': path.employee_seat_id,
        'author': path.document.employee_seat.employee.pip,
        'author_seat_id': path.document.employee_seat_id,
        'main_field': get_main_field(path.document),
    } for path in Document_Path.objects.distinct()
        .filter(document__document_type__meta_doc_type_id=doc_type_id)
        .filter(employee_seat_id__employee_id=user_id)
        .filter(document__testing=testing)
        .filter(document__closed=False)
        .exclude(document__employee_seat__employee=user_id)]

    # Позбавляємось дублікатів:
    work_archive = []
    compare_list = []
    for i in range(0, len(work_archive_with_duplicates)):
        # Порівнюємо документи по ід та ід людино-посади, бо один документ може попасти до декількох людинопосад людини
        entity = {
            'id': work_archive_with_duplicates[i]['id'],
            'emp_seat_id': work_archive_with_duplicates[i]['emp_seat_id']
        }
        if entity not in compare_list:
            compare_list.append(entity)
            work_archive.append(work_archive_with_duplicates[i])

    return {'my_archive': my_archive, 'work_archive': work_archive}


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
    } for empSeat in Employee_Seat.objects.filter(seat_id=chief_id).filter(is_active=True).filter(employee__on_vacation=False)]

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
def get_my_seats(emp_id):
    my_seats = [{  # Список посад юзера
        'id': empSeat.id,
        'seat_id': empSeat.seat_id,
        'seat': empSeat.seat.seat if empSeat.is_main else '(в.о.) ' + empSeat.seat.seat,
    } for empSeat in Employee_Seat.objects.filter(employee_id=emp_id).filter(is_active=True)]

    for emp_seat in my_seats:
        chief = get_chief_emp_seat(emp_seat['id'])
        if chief:
            emp_seat.update({
                'chief': chief['name'] + ', ' + chief['seat']
            })
    return my_seats


# Функція, яка повертає з бд елементарний список посад
@try_except
def get_seats():
    seats = [{
        'id': seat.pk,
        'seat': seat.seat,
    } for seat in Seat.objects.filter(is_active=True).order_by('seat')]
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


# Функція, яка повертає посаду безпосереднього керівника людинопосади
@try_except
def get_chief_id(emp_seat_id):
    # Посада людинопосади:
    seat_id = Employee_Seat.objects.values_list('seat_id', flat=True).filter(id=emp_seat_id)[0]
    chief_id = Seat.objects.values_list('chief_id', flat=True).filter(id=seat_id)

    if chief_id:  # В БД може не бути запису, хто керівник відділу
        # Активна людино-посада безпосереднього керівника:
        chief_emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
            .filter(seat_id=chief_id[0]).filter(is_main=True).filter(is_active=True)

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
        'hide': type_module.hide
    } for type_module in doc_type_modules_query]

    return doc_type_modules


# Функція, яка дописує у doc_request інформацію про автора документа, автора позначки,
# назву типу документа і назву позначки для оформлення електронних листів отримувачам
@try_except
def get_additional_doc_info(doc_request):

    document_info = Document.objects \
        .values(
            'employee_seat_id',
            'employee_seat__employee__pip',
            'document_type',
            'document_type__description') \
        .filter(id=doc_request['document'])[0]

    # doc_type_name = Document_Type.objects.values_list('description', flat=True).filter(id=doc_request['document_type'])[0]

    doc_request.update({
        'doc_author_id': document_info['employee_seat_id'],
        'doc_author_name': document_info['employee_seat__employee__pip'],
        'document_type': document_info['document_type'],
        'doc_type_name': document_info['document_type__description'],
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
        mark_author_name = Employee_Seat.objects.values_list('employee__pip', flat=True).filter(id=doc_request['employee_seat'])[0]
        doc_request.update({
            'mark_name': mark_name,
            'mark_author_name': mark_author_name,
        })
    return doc_request


# Знаходить, яка людино-посада на даний час займає цю посаду або її в.о.
@try_except
def get_actual_emp_seat_from_seat(seat_id):
    emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
        .filter(seat_id=seat_id).filter(is_main=True).filter(is_active=True)
    if emp_seat_id:
        emp_seat_id = vacation_check(emp_seat_id[0])
        return emp_seat_id


@try_except
def get_phase_recipient_list(phase_id):
    recipients = [{
        'seat_id': item.seat_id,
        'employee_seat_id': item.employee_seat_id
    } for item in Doc_Type_Phase_Queue.objects
        .filter(phase_id=phase_id)
        .filter(is_active=True)
        .order_by('queue')]

    recipients_emp_seat_list = []
    for recipient in recipients:
        if recipient['seat_id']:
            recipients_emp_seat_list.append(get_actual_emp_seat_from_seat(recipient['seat_id']))
        elif recipient['employee_seat_id']:
            recipients_emp_seat_list.append(int(recipient['employee_seat_id']))

    return recipients_emp_seat_list


# Повертає ід фази 0 (створення) типу документу
@try_except
def get_zero_phase_id(document_type):
    return Doc_Type_Phase.objects.values_list('id', flat=True) \
        .filter(document_type_id=document_type) \
        .filter(phase=0)\
        .filter(is_active=True)[0]


# Повертає простий список ід посад, які мають бути отримувачами в наступній фазі
# Перевіряє, чи це фаза sole чи ні.
# Sole - це коли зі списку отримувачів потрібно надіслати документ тільки одному:
# найближчому керівнику (н-д у випадку звільнюючої).
@try_except
def get_phase_id_sole_recipients(phase_id, emp_seat):
    recipients = get_phase_recipient_list(phase_id)

    sole = Doc_Type_Phase.objects.values_list('sole', flat=True).filter(id=phase_id)[0]
    if sole:
        chief_seat_id = Employee_Seat.objects.values_list('seat__chief_id', flat=True).filter(id=emp_seat).filter(is_active=True)
        if chief_seat_id:  # False якщо у посади нема внесеного шефа
            chief_emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
                .filter(seat_id=chief_seat_id[0]).filter(is_main=True).filter(is_active=True)[0]

            chief_emp_seat_id = vacation_check(chief_emp_seat_id)

            while chief_emp_seat_id not in recipients:
                chief_seat_id = Employee_Seat.objects.values_list('seat__chief_id', flat=True).filter(id=chief_emp_seat_id).filter(is_active=True)
                if chief_seat_id:  # False якщо у посади нема внесеного шефа
                    chief_emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
                        .filter(seat_id=chief_seat_id[0]).filter(is_main=True).filter(is_active=True)[0]

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

        return [{
            'id': path.document_id,
            'type': path.document.document_type.description,
            'type_id': path.document.document_type_id,
            'date': datetime.strftime(path.timestamp, '%d.%m.%Y'),
            'author_seat_id': path.employee_seat_id,
            'author': path.employee_seat.employee.pip,
            'dep': path.employee_seat.seat.department.name,
            'emp_seat_id': int(emp_seat),
            'is_active': path.document.is_active,
        } for path in Document_Path.objects
            .filter(mark_id=1)
            .filter(employee_seat__seat_id__in=subs)
            .filter(document__testing=testing)
            .filter(document__closed=False)]


@try_except
def get_emp_seat_docs(emp_seat, sub_emp):
    return [{
        'id': path.document_id,
        'type': path.document.document_type.description,
        'type_id': path.document.document_type_id,
        'date': datetime.strftime(path.timestamp, '%d.%m.%Y'),
        'author_seat_id': path.employee_seat_id,
        'author': path.employee_seat.employee.pip,
        'dep': path.employee_seat.seat.department.name,
        'is_active': path.document.is_active,
        'main_field': get_main_field(path.document),
        'emp_seat_id': int(emp_seat)
    } for path in Document_Path.objects
        .filter(mark_id=1)
        .filter(employee_seat_id=sub_emp)
        .filter(document__testing=testing)
        .filter(document__closed=False)]


@try_except
def get_emp_seat_and_doc_type_docs(emp_seat, sub_emp, doc_meta_type):
    return [{
        'id': path.document_id,
        'type': path.document.document_type.description,
        'type_id': path.document.document_type_id,
        'date': datetime.strftime(path.timestamp, '%d.%m.%Y'),
        'author_seat_id': path.employee_seat_id,
        'author': path.employee_seat.employee.pip,
        'dep': path.employee_seat.seat.department.name,
        'is_active': path.document.is_active,
        'emp_seat_id': int(emp_seat)
    } for path in Document_Path.objects
        .filter(document__document_type__meta_doc_type=doc_meta_type)
        .filter(mark_id=1)
        .filter(employee_seat_id=sub_emp)
        .filter(document__testing=testing)
        .filter(document__closed=False)]


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

        return [{
            'id': path.document_id,
            'type': path.document.document_type.description,
            'type_id': path.document.document_type_id,
            'date': datetime.strftime(path.timestamp, '%d.%m.%Y'),
            'author_seat_id': path.employee_seat_id,
            'author': path.employee_seat.employee.pip,
            'dep': path.employee_seat.seat.department.name,
            'emp_seat_id': int(emp_seat),
            'is_active': path.document.is_active,
        } for path in Document_Path.objects
            .filter(document__document_type__meta_doc_type_id=doc_meta_type)
            .filter(mark_id=1)
            .filter(employee_seat__seat_id__in=subs)
            .filter(document__testing=testing)
            .filter(document__closed=False)]


@try_except
def get_doc_modules(doc):
    doc_modules = {}

    type_modules = [{
        'module': type_module.module.module,
        'field_name': None if type_module.field_name is None else type_module.field_name,
        'is_editable': type_module.is_editable,
        'queue': type_module.queue
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

        elif module['module'] == 'articles':
            test = 'test'

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
                'emp_seat_id': item.acquaint_emp_seat.id,
                'emp_seat': item.acquaint_emp_seat.employee.pip + ', ' + item.acquaint_emp_seat.seat.seat,
            } for item in Doc_Acquaint.objects.filter(document_id=doc.id).filter(is_active=True)]
            doc_modules.update({'acquaint_list': acquaint_list})

        elif module['module'] == 'approval_list':
            approval_list = [{
                'id': item.emp_seat.id,
                'emp_seat': item.emp_seat.employee.pip + ', ' + item.emp_seat.seat.seat + get_acting_flag(
                    item.emp_seat.is_main),
                'approved': True if item.approved else False,
                'approved_date': convert_to_localtime(item.approve_path.timestamp, 'day') if item.approved else None,
                'approve_queue': item.approve_queue,
                'comment': item.approve_path.comment if item.approve_path else '',
            } for item in
                Doc_Approval.objects.filter(document_id=doc.id).filter(is_active=True).order_by('-approve_queue')]
            doc_modules.update({'approval_list': approval_list})

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
        elif module['module'] == 'client':
            client = [{
                'id': item.client.id,
                'name': item.client.name,
                'country': item.client.country,
            } for item in Doc_Client.objects.all()
                .filter(document_id=doc.id)
                .filter(is_active=True)]

            if client:
                doc_modules.update({
                    'client': {
                        'id': client[0]['id'],
                        'name': client[0]['name'],
                        'country': client[0]['country']
                }})
        elif module['module'] == 'contract_link':
            contract_link_id = Doc_Contract.objects.values_list('contract_id', flat=True)\
                .filter(document_id=doc.id)\
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

    return doc_modules


@try_except
def is_mark_demand_exists(emp_seat_id, document_id):
    return Mark_Demand.objects\
        .filter(recipient_id=emp_seat_id)\
        .filter(document_id=document_id)\
        .filter(is_active=True)\
        .exists()


@try_except
def get_main_field(document):
    main_field_data = Document_Type_Module.objects.values('module_id', 'queue')\
        .filter(document_type_id=document.document_type_id)\
        .filter(is_main_field=True)[0]

    main_field = []

    if main_field_data['module_id'] == 16:  # Текст
        main_field = Doc_Text.objects.values_list('text', flat=True)\
            .filter(document=document)\
            .filter(queue_in_doc=main_field_data['queue'])\
            .filter(is_active=True)
    elif main_field_data['module_id'] == 26:  # Клієнт
        main_field = Doc_Client.objects.values_list('client__name', flat=True) \
            .filter(document=document) \
            .filter(is_active=True)

    if len(main_field) > 0:
        return main_field[0]
    return ''


@try_except
def get_supervisors(doc_type):
    meta_doc_type = Document_Type.objects.values_list('meta_doc_type', flat=True).filter(id=doc_type)[0]
    supervisors = [{
            'emp_id': item.employee.id,
            'mail': item.employee.user.email,
        } for item in User_Doc_Type_View.objects\
        .filter(meta_doc_type_id=meta_doc_type)\
        .filter(send_mails=True)\
        .filter(is_active=True)]
    if supervisors:
        return supervisors
    return []


@try_except
def get_allowed_new_doc_types(request):
    # Документи, які можна створювати всім, не мають записів у таблиці edms_doc_type_create_rights
    free_doc_types = Document_Type.objects\
        .filter(is_active=True)\
        .filter(~Exists(Doc_Type_Create_Rights.objects.filter(document_meta_type=OuterRef('meta_doc_type'))))

    # Права відділу, до якого відноситься UserProfile
    dep_doc_types = Document_Type.objects\
        .filter(is_active=True)\
        .filter(Exists(Doc_Type_Create_Rights.objects
                       .filter(document_meta_type=OuterRef('meta_doc_type'))
                       .filter(department=request.user.userprofile.department)))

    if not testing:
        free_doc_types = free_doc_types.filter(testing=False)
        dep_doc_types = dep_doc_types.filter(testing=False)

    doc_types = free_doc_types.union(dep_doc_types)\
        # .order_by('description')

    return [{  # Список документів, які може створити юзер
        'id': doc_type.id,
        'description': doc_type.description,
    } for doc_type in doc_types]  # В режимі тестування показуються типи документів, що тестуються

    # Права відділу, до якого відноситься конкретна посада (може і не треба?)
    # Права конкретної посади
    # Права конкретної людино-посади
