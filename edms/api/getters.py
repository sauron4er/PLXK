from django.conf import settings
from django.utils.timezone import datetime

from plxk.api.convert_to_local_time import convert_to_localtime
from accounts import models as accounts  # імпортує моделі Department, UserProfile
from ..models import Seat, Employee_Seat, Document, Document_Type, Mark, Document_Path, File
from ..models import Carry_Out_Items, Doc_Acquaint, Doc_Approval, Doc_Recipient
from ..models import Doc_Text, Doc_Day, Doc_Gate, Doc_Mockup_Type, Doc_Mockup_Product_Type, Doc_Client
from plxk.api.try_except import try_except
from ..models import Document_Type_Module
from ..models import Doc_Type_Phase, Doc_Type_Phase_Queue

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


# Функція, яка повертає інформацію про фазу документа
@try_except
def get_phase_info(doc_request):
    phase_id = doc_request['phase_id']
    if doc_request['phase_id'] == '0':
        phase_id = Doc_Type_Phase.objects.values_list('id', flat=True)\
            .filter(document_type_id=doc_request['document_type'])\
            .filter(phase=0)\
            .filter(is_active=True)

    return Doc_Type_Phase.objects.values('id', 'phase', 'mark_id')\
        .filter(id=phase_id)[0]


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


def get_doc_types():
    return [{
        'id': doc_type.id,
        'description': doc_type.description,
        'creator': '' if doc_type.creator_id is None else doc_type.creator.employee.pip,
    } for doc_type in Document_Type.objects.filter(is_active=True).filter(testing=False)]


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
            'emp_seat_id': empSeat.id,
            'name': empSeat.employee.pip,
            'seat': empSeat.seat.seat if empSeat.is_main is True else empSeat.seat.seat + ' (в.о.)',
        } for empSeat in
            Employee_Seat.objects.filter(seat_id=chief_seat_id).filter(is_active=True).filter(
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


# Функція, яка повертає з бд список відділів
@try_except
def get_deps():
    deps = [{
        'id': dep.pk,
        'dep': dep.name,
        'text': dep.text,
    } for dep in accounts.Department.objects.filter(is_active=True).order_by('name')]
    return deps


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
        else:
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
        'required': type_module.required,
        'queue': type_module.queue,
        'additional_info': type_module.additional_info
    } for type_module in doc_type_modules_query]

    return doc_type_modules


# Функція, яка дописує у doc_request інформацію про автора документа, автора позначки,
# назву типу документа і назву позначки для оформлення електронних листів отримувачам
@try_except
def get_additional_doc_info(doc_request):
    doc_type_name = Document_Type.objects.values_list('description', flat=True).filter(id=doc_request['document_type'])[0]
    doc_author_name = Document.objects.values_list('employee_seat__employee__pip', flat=True).filter(id=doc_request['document'])[0]
    doc_request.update({
        'doc_type_name': doc_type_name,
        'doc_author_name': doc_author_name
    })

    if 'mark' in doc_request.keys():
        mark_name = Mark.objects.values_list('mark', flat=True).filter(id=doc_request['mark'])[0]
        mark_author_name = Employee_Seat.objects.values_list('employee__pip', flat=True).filter(id=doc_request['employee_seat'])[0]
        doc_request.update({
            'mark_name': mark_name,
            'mark_author_name': mark_author_name,
        })
    return doc_request


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
            emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
                .filter(seat_id=recipient['seat_id']).filter(is_main=True).filter(is_active=True)
            if emp_seat_id:
                recipients_emp_seat_list.append(emp_seat_id[0])
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
        chief_seat_id = Employee_Seat.objects.values_list('seat__chief_id', flat=True).filter(id=emp_seat)
        if chief_seat_id:  # False якщо у посади нема внесеного шефа
            chief_emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
                .filter(seat_id=chief_seat_id[0]).filter(is_main=True).filter(is_active=True)[0]

            while chief_emp_seat_id not in recipients:
                chief_seat_id = Employee_Seat.objects.values_list('seat__chief_id', flat=True).filter(id=chief_emp_seat_id).filter(is_active=True)
                if chief_seat_id:  # False якщо у посади нема внесеного шефа
                    chief_emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
                        .filter(seat_id=chief_seat_id[0]).filter(is_main=True)[0]

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
        'emp_seat_id': int(emp_seat)
    } for path in Document_Path.objects
        .filter(mark_id=1)
        .filter(employee_seat_id=sub_emp)
        .filter(document__testing=testing)
        .filter(document__closed=False)]


@try_except
def get_emp_seat_and_doc_type_docs(emp_seat, sub_emp, doc_type):
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
        .filter(document__document_type_id=doc_type)
        .filter(mark_id=1)
        .filter(employee_seat_id=sub_emp)
        .filter(document__testing=testing)
        .filter(document__closed=False)]


@try_except
def get_doc_type_docs(emp_seat, doc_type):
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
            .filter(document__document_type_id=doc_type)
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
        'is_editable': type_module.is_editable
    } for type_module in Document_Type_Module.objects
        .filter(document_type_id=doc.document_type_id)
        .filter(is_active=True)
        .order_by('queue')]
    doc_modules.update({
        'type_modules': type_modules,
    })

    # збираємо з використовуваних модулів інфу про документ
    for module in type_modules:
        if module['module'] in ['text', 'dimensions', 'packaging_type']:
        # if module['module'] == 'text':
            # Шукаємо список текстових полів тільки для першого текстового модуля, щоб не брати ту ж інфу ще раз
            if 'text_list' not in doc_modules.keys():
                text_list = [{
                    'queue': item.queue_in_doc,
                    'text': item.text}
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
            day = [{
                'day': datetime.strftime(item.day, '%Y-%m-%d'),
            } for item in Doc_Day.objects.filter(document_id=doc.id).filter(is_active=True)]

            if day:
                doc_modules.update({'day': day[0]['day']})

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

    return doc_modules
