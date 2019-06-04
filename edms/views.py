from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, HttpResponseForbidden, QueryDict
from django.contrib.auth.decorators import login_required
from django.utils.timezone import datetime
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
import json
import pytz
import smtplib

from accounts import models as accounts  # import models Department, UserProfile
from .models import Seat, Employee_Seat, Document, File, Document_Path, Document_Type, Document_Type_Permission, Mark
from .models import Carry_Out_Items, Mark_Demand
from .forms import DepartmentForm, SeatForm, UserProfileForm, EmployeeSeatForm, DocumentForm, DocumentPathForm
from .forms import CarryOutItemsForm, ResolutionForm
from .forms import DTPDeactivateForm, DTPAddForm
# Модульна система:
from .models import Module, Document_Type_Module, Doc_Name, Doc_Preamble, Doc_Acquaint, Doc_Article, Doc_Article_Dep
from .models import Doc_Text, Doc_Recipient, Doc_Day, Doc_Gate, Doc_Type_Unique_Number
from .forms import NewArticleForm, NewArticleDepForm, NewAcquaintForm, NewNameForm, NewPreambleForm, NewFileForm
from .forms import NewTextForm, NewRecipientForm, NewDayForm, NewGateForm, FileNewPathForm
# Система фаз:
from .models import Doc_Type_Phase, Doc_Type_Phase_Queue
from .forms import MarkDemandForm, DeactivateMarkDemandForm, DeactivateDocForm, DeleteDocForm


# При True у списках відображаться і ті документи, які знаходяться в режимі тестування.
testing = False


def convert_to_localtime(utctime, frmt):
    if frmt == 'day':
        fmt = '%d.%m.%Y'
    else:
        fmt = '%d.%m.%Y %H:%M'

    utc = utctime.replace(tzinfo=pytz.UTC)
    localtz = utc.astimezone(timezone.get_current_timezone())
    return localtz.strftime(fmt)


# Функція, яка рекурсією шукає всіх підлеглих посади користувача і їх підлеглих
def get_subs_list(seat):
    seats = [{'id': seat.id} for seat in Seat.objects.filter(chief_id=seat)]  # Знаходимо підлеглих посади
    temp_seats = []
    if seats:  # якщо підлеглі є:
        for seat in seats:
            temp_seats.append({'id': seat['id']})  # додамо кожного підлеглого у список
            new_seats = get_subs_list(seat['id'])  # і шукаємо його підлеглих
            if new_seats is not None:  # якщо підлеглі є, додаємо і їх у список
                for new_seat in new_seats:
                    temp_seats.append({'id': new_seat['id']})
        return temp_seats
    else:
        return None


# Функція, яка рекурсією шукає всіх начальників посади користувача і їх начальників
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
    return ''


# Функція, яка повертає список всіх актуальних посад та керівників щодо цих посад юзера
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
def get_deps():
    deps = [{
        'id': dep.pk,
        'dep': dep.name,
        'text': dep.text,
    } for dep in accounts.Department.objects.filter(is_active=True).order_by('name')]
    return deps


# Функція, яка повертає з бд елементарний список посад
def get_seats():
    seats = [{
        'id': seat.pk,
        'seat': seat.seat,
    } for seat in Seat.objects.filter(is_active=True).order_by('seat')]
    return seats


# Функція, яка повертає список пунктів документу
def get_doc_articles(doc_id):
    articles = [{
        'id': article.id,
        'text': article.text,
        'deadline': None if not article.deadline else datetime.strftime(article.deadline, '%Y-%m-%d'),
        'deps': get_responsible_deps(article.id),  # Знаходимо список відповідальних за пункт окремою функцією
    } for article in Doc_Article.objects.filter(document_id=doc_id).filter(is_active=True)]

    return articles


# Функція, яка повертає з бд список відділів, відповідальних за виконання пункту документу
def get_responsible_deps(article_id):
    deps = [{
        'id': dep.department.id,
        'dep': dep.department.name,
    } for dep in Doc_Article_Dep.objects.filter(article_id=article_id).filter(is_active=True)]

    return deps


# Функції фазової системи ----------------------------------------------------------------------------------------------
def send_email(email_type, recipients, doc_id):
    if not testing:
        for recipient in recipients:
            emp_seat_id = vacation_check(recipient['id'])
            recipient_mail = Employee_Seat.objects.values('employee__user__email').filter(id=emp_seat_id)
            mail = recipient_mail[0]['employee__user__email']

            if mail:
                HOST = "imap.polyprom.com"

                SUBJECT = "Новий електронний документ" \
                    if email_type == 'new' \
                    else "Нова реакція на Ваш електронний документ"

                TO = mail

                FROM = "it@lxk.com.ua"

                if email_type == 'new':
                    text = "Вашої реакції очікує новий документ. " \
                           "Щоб переглянути, перейдіть за посиланням: http://plhk.com.ua/edms/my_docs/" + str(doc_id) + ""
                else:
                    text = "У Вашого електронного документу (№ " + str(doc_id) + ") з’явилася нова позначка. " \
                           "Щоб переглянути, перейдіть за посиланням: http://plhk.com.ua/edms/my_docs/" + str(doc_id) + ""

                BODY = u"\r\n".join((
                    "From: " + FROM,
                    "To: " + TO,
                    "Subject: " + SUBJECT,
                    "",
                    text
                )).encode('cp1251').strip()

                server = smtplib.SMTP(HOST)
                server.login('lxk_it', 'J2NYEHb50nymRF1L')
                server.sendmail(FROM, [TO], BODY)
                server.quit()


def post_path(doc_request):
    # створюємо новий path
    path_form = DocumentPathForm(doc_request)
    if path_form.is_valid():
        return path_form.save()
    else:
        raise ValidationError('edms/views: function post_path: path_form invalid')


def delete_doc(doc_request, doc_id):
    try:
        doc = get_object_or_404(Document, pk=doc_id)
        doc_request.update({'closed': True})
        delete_doc_form = DeleteDocForm(doc_request, instance=doc)
        if delete_doc_form.is_valid():
            delete_doc_form.save()
        else:
            raise ValidationError('edms/view func delete_doc: delete_doc_form invalid')
    except ValidationError as err:
        raise err
    except Exception as err:
        raise err


def deactivate_doc(doc_request, doc_id):
    try:
        doc = get_object_or_404(Document, pk=doc_id)
        doc_request.update({'is_active': False})
        deactivate_doc_form = DeactivateDocForm(doc_request, instance=doc)
        if deactivate_doc_form.is_valid():
            deactivate_doc_form.save()
        else:
            raise ValidationError('edms/view func deactivate_doc: deactivate_doc_form invalid')
    except ValidationError as err:
        raise err
    except Exception as err:
        raise err


def post_mark_demand(doc_request, emp_seat_id, phase_id, mark):
    emp_seat_id = vacation_check(emp_seat_id)
    if not doc_request['comment']:
        doc_request.update({'comment': None})
    doc_request.update({'recipient': emp_seat_id})
    doc_request.update({'phase': phase_id})
    doc_request.update({'mark': mark})

    mark_demand_form = MarkDemandForm(doc_request)
    if mark_demand_form.is_valid:
        mark_demand_form.save()
        test = 5
    else:
        raise ValidationError('edms/views new_phase mark_demand_form invalid')


def deactivate_mark_demand(doc_request, md_id):
    md = get_object_or_404(Mark_Demand, pk=md_id)
    doc_request.update({'is_active': False})

    deactivate_mark_demand_form = DeactivateMarkDemandForm(doc_request, instance=md)
    if deactivate_mark_demand_form.is_valid:
        deactivate_mark_demand_form.save()
    else:
        raise ValidationError('edms/views deactivate_mark_demand deactivate_mark_demand_form invalid')


# Функція, яка отримує ід людинопосади, перевіряє чи вона у відпустці і повертає її id або id в.о.
def vacation_check(emp_seat_id):
    # Перевіряємо, чи людина у відпустці:
    emp_on_vacation = Employee_Seat.objects.values_list('employee__on_vacation', flat=True) \
        .filter(id=emp_seat_id)

    if emp_on_vacation[0] is True:
        # Активна людино-посада в.о.:
        acting_emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
            .filter(acting_for_id=emp_seat_id).filter(is_active=True)
        return acting_emp_seat_id
    else:
        return emp_seat_id


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
                .filter(seat_id=recipient['seat_id']).filter(is_main=True)
            if emp_seat_id:
                recipients_emp_seat_list.append(emp_seat_id[0])
        elif recipient['employee_seat_id']:
            recipients_emp_seat_list.append(int(recipient['employee_seat_id']))

    return recipients_emp_seat_list


# Повертає простий список ід посад, які мають бути отримувачами в наступній фазі
# Перевіряє, чи це фаза sole чи ні.
# Sole - це коли зі списку отримувачів потрібно надіслати документ тільки одному:
# найближчому керівнику у випадку звільнюючої.
def get_phase_id_recipients(phase_id, emp_seat):
    recipients = get_phase_recipient_list(phase_id)

    sole = Doc_Type_Phase.objects.values_list('sole', flat=True).filter(id=phase_id)[0]
    if sole:
        chief_seat_id = Employee_Seat.objects.values_list('seat__chief_id', flat=True).filter(id=emp_seat)
        if chief_seat_id:  # False якщо у посади нема внесеного шефа
            chief_emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
                .filter(seat_id=chief_seat_id[0]).filter(is_main=True)[0]

            while chief_emp_seat_id not in recipients:
                chief_seat_id = Employee_Seat.objects.values_list('seat__chief_id', flat=True).filter(id=chief_emp_seat_id)
                if chief_seat_id:  # False якщо у посади нема внесеного шефа
                    chief_emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
                        .filter(seat_id=chief_seat_id[0]).filter(is_main=True)[0]

            return [chief_emp_seat_id]
    else:
        return recipients


# Створення нової фази документа:
def new_phase(doc_request, phase_number, modules_recipients):
    # mark_recipients = []  # Список людинопосад, яким направляємо документ
    mail_recipients = []  # Список людей, яким направляємо лист

    # Перебираємо список modules_recipients в пошуках отримувачів, яких визначено автором при створенні документа:
    for recipient in modules_recipients:
        # Якщо отримувач - шеф:
        if recipient['type'] == 'chief':
            # Знаходимо ід поточної фази, в якій використовується позначка 2 (Погоджую)
            phase_id = Doc_Type_Phase.objects.values_list('id', flat=True) \
                .filter(document_type_id=doc_request['document_type']) \
                .filter(phase=phase_number) \
                .filter(mark_id=2)

            # Витягуємо ід кінцевого отримувача із інфи про документ:
            recipient_chief = recipient['id']

            # Визначаємо ід керівника автора позначки:
            chief = get_chief_emp_seat(doc_request['employee_seat'])

            # Якщо керівник автора є кінцевим отримувачем,
            # відправляємо йому позначку 1, бо це щойно створений документ
            # (модулі використовуються тільки при створенні),
            # позначка 2 - погоджую.
            if recipient_chief == chief['emp_seat_id']:
                recipient_chief = vacation_check(recipient_chief)
                post_mark_demand(doc_request, recipient_chief, phase_id, 2)
                send_email('new', [{'id': recipient_chief}], doc_request['document'])

            # Якщо ні, фазу не змінюємо, відправляємо керівнику,
            # замінюємо ід отримувача листа, позначка - не заперечую
            else:
                recipient_chief = vacation_check(chief['emp_seat_id'])
                post_mark_demand(doc_request, recipient_chief, phase_id, 6)
                send_email('new', [{'id': recipient_chief}], doc_request['document'])

        elif recipient['type'] == 'acquaint':
            # Знаходимо ід поточної фази для занесення в mark_demand:
            phase_id = Doc_Type_Phase.objects.values_list('id', flat=True) \
                .filter(document_type_id=doc_request['document_type']) \
                .filter(phase=0)  # Тут завжди 0, бо модулі використовуються тільки при створенні документа

            recipient_acquaint = vacation_check(recipient['id'])
            post_mark_demand(doc_request, recipient_acquaint, phase_id, 8)
            send_email('new', {'id': recipient_acquaint}, doc_request['document'])

    # Знаходимо id's відповідної фази:
    # За одним номером фази може бути декілька самих ід фаз.
    # Тобто, н-д, на першій фазі документ може йти відразу декільком отримувачам.
    doc_type = Document.objects.values_list('document_type_id', flat=True).filter(id=doc_request['document'])[0]
    phase_ids = Doc_Type_Phase.objects.values_list('id', flat=True)\
        .filter(document_type_id=doc_type).filter(phase=phase_number)

    if phase_ids:
        for phase_id in phase_ids:

            phase_info = [{
                'mark_id': phase.mark_id,
                'is_approve_chained': phase.is_approve_chained,
            } for phase in Doc_Type_Phase.objects
                .filter(id=phase_id)
                .filter(is_active=True)]

            # Визначаємо, яка позначка використовується у даній фазі:
            if phase_info[0]['mark_id'] == 6:
                # Якщо позначка "Не заперечую", документ передається безпосередньому керівнику:
                # Посада безпосереднього керівника:
                chief_seat_id = Employee_Seat.objects.values_list('seat__chief_id', flat=True).filter(
                    id=doc_request['employee_seat'])

                if chief_seat_id:  # Посада шефа може бути не внесена в бд
                    # Активна людино-посада безпосереднього керівника:
                    chief_emp_seat_id = Employee_Seat.objects.values_list('id', flat=True) \
                        .filter(seat_id=chief_seat_id).filter(is_main=True)

                    if chief_emp_seat_id:  # Можливо, ніхто не займає цю посаду
                        # Якщо безпосередній керівник позначений як отримувач наступної фази,
                        # то переходимо на наступну фазу одразу:
                        next_phase_ids = Doc_Type_Phase.objects.values_list('id', flat=True) \
                            .filter(document_type_id=doc_type).filter(phase=phase_number+1)

                        chief_is_in_next_phase = False
                        for phase in next_phase_ids:
                            if chief_emp_seat_id[0] in get_phase_recipient_list(phase):
                                chief_is_in_next_phase = True
                                post_mark_demand(doc_request, chief_emp_seat_id[0], phase, 2)
                                send_email('new', [{'id': chief_emp_seat_id[0]}], doc_request['document'])
                                break

                        if not chief_is_in_next_phase:
                            mail_recipients.append({'id': chief_emp_seat_id[0]})
                            post_mark_demand(doc_request, chief_emp_seat_id[0], phase_id, phase_info[0]['mark_id'])
                            # mark_recipients.append({'id': chief_emp_seat_id[0]})
            else:
                # Визначаємо усіх отримувачів для кожної позначки:
                recipients = get_phase_id_recipients(phase_id, doc_request['employee_seat'])
                for recipient in recipients:
                    mail_recipients.append({'id': recipient})
                    post_mark_demand(doc_request, recipient, phase_id, phase_info[0]['mark_id'])
                    # mark_recipients.append({'id': recipient})

            # Додаємо кожного отримувача у MarkDemand:
            # for recipient in mark_recipients:
            #     post_mark_demand(doc_request, recipient['id'], phase_id, phase_info[0]['mark_id'])

        if modules_recipients:
            send_email('new', mail_recipients, doc_request['document'])
    else:
        test = 'test'


# Деактивація всіх MarkDemand документа:
def deactivate_doc_mark_demands(doc_request, doc_id):
    mark_demands = [{
        'id': md.id,
    } for md in Mark_Demand.objects.filter(document_id=doc_id).filter(is_active=True)]

    for md in mark_demands:
        deactivate_mark_demand(doc_request, md['id'])


# Обробка різних видів позначок: ---------------------------------------------------------------------------------------
def post_mark_delete(doc_request):
    delete_doc(doc_request, int(doc_request['document']))
    deactivate_doc_mark_demands(doc_request, int(doc_request['document']))


def post_mark_deactivate(doc_request):
    deactivate_doc(doc_request, int(doc_request['document']))
    deactivate_doc_mark_demands(doc_request, int(doc_request['document']))


# Функції модульних документів -----------------------------------------------------------------------------------------

# Функція, яка додає у бд новий документ та повертає його id
def post_document(request):
    try:
        doc_request = request.POST.copy()
        doc_request.update({'employee': request.user.userprofile.id})
        doc_request.update({'text': request.POST.get('text', None)})  # Якщо поля text немає, у форму надсилається null
        doc_request.update({'testing': testing})

        doc_form = DocumentForm(doc_request)
        if doc_form.is_valid():
            new_doc = doc_form.save()
            return new_doc
        else:
            raise ValidationError('edms/views: function post_document: document_form invalid')
    except Exception as err:
        raise err


# Функція, яка перебирає список модулів і викликає необхідні функції для їх публікації
# Повертає список отримувачів документа (якщо використовуються модулі recipient або recipient_chief)
def post_modules(doc_request, doc_files, new_path):
    try:
        doc_modules = json.loads(doc_request['doc_modules'])
        recipients = []

        # Додаємо назву документа
        if 'name' in doc_modules:
            post_name(doc_request, doc_modules['name'])

        # Додаємо текст документа
        if 'text' in doc_modules:
            post_text(doc_request, doc_modules['text'])

        # Додаємо отримувача-шефа
        # Отримувач-шеф отримує mark-demand з вимогою поставити "Погоджую"
        # Звичайний отримувач - якусь іншу позначку.
        if 'recipient_chief' in doc_modules:
            post_recipient_chief(doc_request, doc_modules['recipient_chief']['id'])
            recipients.append({'id': doc_modules['recipient_chief']['id'], 'type': 'chief'})

        # Додаємо преамбулу документа
        if 'preamble' in doc_modules:
            post_preamble(doc_request, doc_modules['preamble'])

        # Додаємо список отримувачів на ознайомлення
        if 'acquaint_list' in doc_modules:
            post_acquaint_list(doc_request, doc_modules['acquaint_list'])
            for acquaint in doc_modules['acquaint_list']:
                recipients.append({'id': acquaint['id'], 'type': 'acquaint'})

        # Додаємо пункти
        if 'articles' in doc_modules:
            post_articles(doc_request, doc_modules['articles'])

        # Додаємо дату
        if 'day' in doc_modules:
            post_day(doc_request, doc_modules['day'])

        # Додаємо прохідну
        if 'gate' in doc_modules:
            post_gate(doc_request, doc_modules['gate'])

        # Додаємо список матеріальних цінностей
        if 'carry_out_items' in doc_modules:
            post_carry_out_items(doc_request, doc_modules['carry_out_items'])

        # Додаємо файли
        if 'files' in doc_modules:
            # Додаємо файли зі старої чернетки:
            old_files = json.loads(doc_request['old_files'])
            if old_files:
                for old_file in old_files:
                    file = get_object_or_404(File, pk=old_file['id'])
                    file_change_path_form = FileNewPathForm(doc_request, instance=file)
                    if file_change_path_form.is_valid():
                        file_change_path_form.save()
                    else:
                        raise ValidationError('edms/view func post_modules: file_change_path_form invalid')

            # Додаємо нові файли:
            if doc_files:
                # Поки що файли додаються тільки якщо документ публікується не як чернетка
                # Для публікації файла необідно мати перший path_id документа, якго нема в чернетці
                if new_path is not None:
                    handle_files(doc_files, doc_request, new_path.pk)

        return recipients
    except ValidationError as err:
        raise err


# Функція, яка додає у бд нові пункти документу
def post_articles(doc_request, articles):
    try:
        for article in articles:
            doc_request.update({
                'text': article['text'],
                'deadline': article['deadline'],
            })
            article_form = NewArticleForm(doc_request)
            if article_form.is_valid():
                new_article_id = article_form.save().pk
                for dep in article['deps']:
                    doc_request.update({'article': new_article_id})
                    doc_request.update({'department': dep['id']})
                    article_dep_form = NewArticleDepForm(doc_request)
                    if article_dep_form.is_valid():
                        article_dep_form.save()
                    else:
                        raise ValidationError('edms/view func post_articles: article_dep_form invalid')
            else:
                raise ValidationError('edms/view func post_articles: article_form invalid')
    except ValueError as err:
        raise err


# Функція, яка додає у бд список отримуючих на ознайомлення
def post_acquaint_list(doc_request, acquaint_list):
    for recipient in acquaint_list:
        emp_seat_id = vacation_check(recipient['id'])
        doc_request.update({'acquaint_emp_seat': emp_seat_id})

        acquaint_form = NewAcquaintForm(doc_request)
        if acquaint_form.is_valid():
            acquaint_form.save()
        else:
            raise ValidationError('edms/views post_acquaint_list acquaint_form invalid')


# Функція, яка додає у бд назву документу
def post_name(doc_request, name):
    doc_request.update({'name': name})
    name_form = NewNameForm(doc_request)
    if name_form.is_valid():
        name_form.save()
    else:
        raise ValidationError('edms/views post_name name_form invalid')


# Функція, яка додає у бд текст документу
def post_text(doc_request, text):
    doc_request.update({'text': text})
    text_form = NewTextForm(doc_request)
    if text_form.is_valid():
        text_form.save()
    else:
        raise ValidationError('edms/views post_text text_form invalid')


# Функція, яка додає у бд отримувача зі списку шефів користувача
def post_recipient_chief(doc_request, recipient_chief):
    chief_emp_seat_id = vacation_check(recipient_chief)
    doc_request.update({'recipient': chief_emp_seat_id})

    recipient_form = NewRecipientForm(doc_request)
    if recipient_form.is_valid():
        recipient_form.save()
    else:
        raise ValidationError('edms/views post_recipient_chief recipient_form invalid')

    # (Додаємо mark_demand) - тепер mark_demand завжди додається у new_phase
    # if doc_request['is_draft'] == 'false':
    #     doc_request.update({'document_path': path.pk})
    #     doc_type = Document.objects.values_list('document_type_id', flat=True).filter(id=doc_request['document'])[0]
    #     phase_id = Doc_Type_Phase.objects.values_list('id', flat=True).filter(document_type_id=doc_type).filter(phase=1)[0]
    #     post_mark_demand(doc_request, recipient_chief['id'], phase_id, 2)


# Функція, яка додає у бд преамбулу документу
def post_preamble(doc_request, preamble):
    doc_request.update({'preamble': preamble})
    preamble_form = NewPreambleForm(doc_request)
    if preamble_form.is_valid():
        preamble_form.save()
    else:
        raise ValidationError('edms/views post_preamble preamble_form invalid')


# Функція, яка додає у бд дату документу
def post_day(doc_request, day):
    doc_request.update({'day': day})
    day_form = NewDayForm(doc_request)
    if day_form.is_valid():
        day_form.save()
    else:
        raise ValidationError('edms/views post_day day_form invalid')


# Функція, яка додає у бд прохідну
def post_gate(doc_request, gate):
    doc_request.update({'gate': gate})
    gate_form = NewGateForm(doc_request)
    if gate_form.is_valid():
        gate_form.save()
    else:
        raise ValidationError('edms/views post_day day_form invalid')


# Функція, яка додає у бд дату документу
def post_carry_out_items(doc_request, carry_out_items):
    for item in carry_out_items:
        doc_request.update({'item_name': item['item_name']})
        doc_request.update({'quantity': item['quantity']})
        doc_request.update({'measurement': item['measurement']})
        carry_out_item_form = CarryOutItemsForm(doc_request)
        if carry_out_item_form.is_valid():
            carry_out_item_form.save()
        else:
            raise ValidationError('edms/views post_carry_out_item carry_out_item_form invalid')


# Функція, яка постить файли
def handle_files(doc_files, doc_request, path_id):
    if len(doc_files) > 0:
        # TODO додати обробку помилок при збереженні файлів
        doc_request.update({'document_path': path_id})
        doc_request.update({'name': 'file'})

        file_form = NewFileForm(doc_request, doc_files)
        if file_form.is_valid():
            document_path = file_form.cleaned_data['document_path']
            for f in doc_files.getlist('file'):
                File.objects.create(
                    document_path=document_path,
                    file=f,
                    name=f.name
                )
        else:
            raise ValidationError('edms/views: function handle_files: file_form invalid')
# ---------------------------------------------------------------------------------------------------------------------


@login_required(login_url='login')
def edms_main(request):
    if request.method == 'GET':
        return render(request, 'edms/main.html')
    return HttpResponse(status=405)

# Адміністрування ------------------------------------------------------------------------------------------------------
@login_required(login_url='login')
def edms_administration(request):
    if request.method == 'GET':
        my_seats = get_my_seats(request.user.userprofile.id)
        seats = [{  # Список посад для форм на сторінці відділу кадрів
            'id': seat.pk,
            'seat': seat.seat,
        } for seat in Seat.objects.filter(is_active=True).order_by('seat')]
        marks = [{
            'id': mark.pk,
            'mark': mark.mark,
        } for mark in Mark.objects.filter(is_active=True)]
        return render(request, 'edms/administration/administration.html', {
            'my_seats': my_seats,
            'seats': seats,
            'marks': marks,
        })

    if request.method == 'POST':
        form = DTPAddForm(request.POST)
        if form.is_valid():
            new_dtp = form.save()
            return HttpResponse(new_dtp.pk)

    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_deactivate_permission(request, pk):
    permission = get_object_or_404(Document_Type_Permission, pk=pk)
    if request.method == 'POST':
        form = DTPDeactivateForm(request.POST, instance=permission)
        if form.is_valid():
            form.save()
            return redirect('administration.html')


@login_required(login_url='login')
def edms_get_types(request, pk):
    # Отримуємо ід посади з ід людинопосади
    seat_id = Employee_Seat.objects.filter(id=pk).values_list('seat_id')[0][0]

    if request.method == 'GET':
        if request.user.userprofile.is_it_admin:
            doc_types_query = Document_Type.objects.all()

            # Якщо параметр testing = False - програма показує лише ті типи документів, які не тестуються.
            if not testing:
                doc_types_query = doc_types_query.filter(testing=False)

            doc_types = [{
                'id': doc_type.id,
                'description': doc_type.description,
                'creator': '' if doc_type.creator_id is None else doc_type.creator.employee.pip,
            } for doc_type in doc_types_query]
        else:
            doc_types = [{
                'id': doc_type.id,
                'description': doc_type.description,
                'creator': '' if doc_type.creator_id is None else doc_type.creator.employee.pip,
            } for doc_type in Document_Type.objects.filter(creator_id=seat_id)]

            # Відділ кадрів може змінювати свої документи та загальні (не створені іншими користувачами)
            # if request.user.userprofile.is_hr:
            #     hr_doc_types = [{
            #         'id': doc_type.id,
            #         'description': doc_type.description,
            #         'creator': '',
            #     } for doc_type in Document_Type.objects.filter(creator_id=None).filter(testing=False)]
            #     doc_types = doc_types + hr_doc_types

        return HttpResponse(json.dumps(doc_types))


@login_required(login_url='login')
def edms_get_type_info(request, pk):
    # Отримуємо ід типу документу
    doc_type_id = Document_Type.objects.filter(id=pk).values_list('id')[0][0]

    if request.method == 'GET':
        permissions = [{  # Список дозволів для посад для цього документу
            'id': permission.id,
            'seat_id': permission.seat.id,
            'seat': permission.seat.seat,
            'mark_id': permission.mark.id,
            'mark': permission.mark.mark,
        } for permission in Document_Type_Permission.objects
            .filter(document_type_id=doc_type_id)
            .filter(is_active=True)]

        return HttpResponse(json.dumps(permissions))


@login_required(login_url='login')
def edms_get_modules_phases(request, pk):
    doc_type_id = Document_Type.objects.filter(id=pk).values_list('id', flat=True)
    if doc_type_id:
        # Якщо ід != 0, значить редагується старий документ, розділяємо модулі на 'chosen' i 'left'
        modules_all = [{
            'id': module.id,
            'name': module.name,
            'description': module.description,
            # 'field_name': ''
        } for module in Module.objects
            .filter(is_active=True)]

        modules_chosen = [{
            'id': doc_type_module.module.id,
            'name': doc_type_module.module.name,
            'description': doc_type_module.module.description,
            # 'field_name': doc_type_module.field_name
        } for doc_type_module in Document_Type_Module.objects
            .filter(document_type_id=doc_type_id[0])
            .filter(is_active=True).order_by('queue')]

        modules_left = []
        for module in modules_all:
            if module not in modules_chosen:
                modules_left.append(module)

        phases_all = [{
            'id': phase.id,
            'name': phase.mark,
        } for phase in Mark.objects
            .filter(is_phase=True)
            .filter(is_active=True)]

        phases_chosen = [{
            'id': doc_type_phase.mark.id,
            'name': doc_type_phase.mark.mark,
        } for doc_type_phase in Doc_Type_Phase.objects
            .filter(document_type_id=doc_type_id[0])
            .filter(is_active=True)
            .exclude(phase=0).order_by('phase')]

        phases_left = []
        for phase in phases_all:
            if phase not in phases_chosen:
                phases_left.append(phase)
    else:
        # Якщо ід = 0, значить створюється новий документ, показуємо всі модулі і фази в 'left'
        modules_left = [{
            'id': module.id,
            'name': module.name,
            'description': module.description,
            'field_name': ''
        } for module in Module.objects
            .filter(is_active=True)]

        phases_left = [{
            'id': phase.id,
            'name': phase.mark,
        } for phase in Mark.objects
            .filter(is_phase=True)
            .filter(is_active=True)]

        modules_chosen = []
        phases_chosen = []

    response = {
        'modules_chosen': modules_chosen,
        'modules_left': modules_left,
        'phases_chosen': phases_chosen,
        'phases_left': phases_left
    }

    return HttpResponse(json.dumps(response))


# Відділ кадрів --------------------------------------------------------------------------------------------------------
@login_required(login_url='login')
def edms_hr(request):
    if request.method == 'GET':

        deps = get_deps()

        seats = [{       # Список посад для форм на сторінці відділу кадрів
            'id': seat.pk,
            'seat': seat.seat,
            'dep': 'Не внесено' if seat.department is None else seat.department.name,
            'dep_id': 0 if seat.department is None else seat.department.id,
            'is_dep_chief': 'true' if seat.is_dep_chief else 'false',
            'chief': 'Не внесено' if seat.chief is None else seat.chief.seat,
            'chief_id': 0 if seat.chief is None else seat.chief.id,
        } for seat in Seat.objects.all().filter(is_active=True).order_by('seat')]

        # Додаємо поле "вакансія" у список посад (посада, де вакансія = True, буде виділятися червоним)
        # for seat in seats:
        #     occupied_by = Employee_Seat.objects.filter(seat_id=seat['id']).filter(is_active=True).first()
        #     seat['is_vacant'] = 'true' if occupied_by is None else 'false'

        emps = [{       # Список працівників для форм на сторінці відділу кадрів
            'id': emp.pk,
            'emp': emp.pip,
            'on_vacation': 'true' if emp.on_vacation else 'false',
            'acting': 0 if emp.acting is None else emp.acting.pip,
            'acting_id': 0 if emp.acting is None else emp.acting.id,
            'tab_number': '' if emp.tab_number is None else emp.tab_number,
        } for emp in accounts.UserProfile.objects.only(
            'id', 'pip', 'on_vacation', 'acting').filter(is_active=True).order_by('pip')]

        return render(request, 'edms/hr/hr.html', {
            'deps': deps,
            'seats': seats,
            'emps': emps,
        })

    elif request.method == 'POST':

        if 'new_dep' in request.POST:
            form = DepartmentForm(request.POST)
            if form.is_valid():
                new_dep = form.save()
                return HttpResponse(new_dep.pk)

        if 'new_seat' in request.POST:
            form = SeatForm(request.POST)
            if form.is_valid():
                new_seat = form.save()
                return HttpResponse(new_seat.pk)

        if 'new_emp_seat' in request.POST:
            form_employee_seat = EmployeeSeatForm(request.POST)
            if form_employee_seat.is_valid():
                new_emp_seat = form_employee_seat.save()
                return HttpResponse(new_emp_seat.pk)

    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_hr_emp(request, pk):       # changes in employee row
    post = get_object_or_404(accounts.UserProfile, pk=pk)
    if request.method == 'POST':
        form = UserProfileForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect('hr.html')
    elif request.method == 'GET':
        emp_seats = [{  # список зв’язків посада-співробітник
            'id': empSeat.pk,
            'seat': empSeat.seat.seat,
        } for empSeat in Employee_Seat.objects.only('id', 'seat').filter(employee_id=pk).filter(is_active=True).order_by('seat')]
        return HttpResponse(emp_seats)


@login_required(login_url='login')
def edms_hr_dep(request, pk):       # changes in department row
    post = get_object_or_404(accounts.Department, pk=pk)
    if request.method == 'POST':
        form = DepartmentForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect('hr.html')


@login_required(login_url='login')
def edms_hr_seat(request, pk):       # changes in seat row
    post = get_object_or_404(Seat, pk=pk)
    if request.method == 'POST':
        form = SeatForm(request.POST, instance=post)
        if form.is_valid():
            form.save()
            return redirect('hr.html')


@login_required(login_url='login')
def edms_hr_emp_seat(request, pk):       # changes in emp_seat row
    post = get_object_or_404(Employee_Seat, pk=pk)
    if request.method == 'POST':
        form_request = request.POST.copy()
        form = EmployeeSeatForm(form_request, instance=post)

        # Обробка звільнення з посади:
        if form.data['is_active'] == 'false':
            active_docs = Mark_Demand.objects.filter(recipient_id=pk).filter(is_active=True).first()
            # Якщо у mark_demand є хоча б один документ і не визначено "спадкоємця", повертаємо помилку
            if active_docs is not None and form.data['successor_id'] == '':
                return HttpResponseForbidden('active flow')
            # В іншому разі зберігаємо форму і додаємо "спадкоємцю" (якщо такий є) посаду:
            else:
                if form.data['successor_id'] != '':
                    successor_temp = {
                        'employee': form.data['successor_id'],
                        'seat': form.data['seat'],
                        'is_active': True,
                        'is_main': form.data['new_is_main']
                    }
                    successor = QueryDict('').copy()
                    successor.update(successor_temp)
                    successor_form = EmployeeSeatForm(successor)
                    if successor_form.is_valid():
                        new_successor = successor_form.save()
                        form.data['successor'] = new_successor.pk
                        if form.is_valid():
                            form.save()
                            return HttpResponse('')
                else:
                    if form.is_valid():
                        form.save()
                        return HttpResponse('')


@login_required(login_url='login')
def edms_get_emp_seats_hr(request, pk):
    emp = get_object_or_404(accounts.UserProfile, pk=pk)
    if request.method == 'GET':
        emp_seats = [{
            'id': empSeat.pk,
            'emp_seat': empSeat.seat.seat if empSeat.is_main is True else empSeat.seat.seat + ' (в.о.)',
            'seat_id': empSeat.seat.pk,
            'emp_id': empSeat.employee.pk,
        } for empSeat in
            Employee_Seat.objects.only('id', 'seat', 'employee').filter(employee_id=emp).filter(is_active=True)]

        return HttpResponse(json.dumps(emp_seats))


@login_required(login_url='login')
def edms_get_emp_seats(request):
    if request.method == 'GET':
        emp_seats = [{
            'id': empSeat.pk,
            'seat': empSeat.seat.seat if empSeat.is_main is True else empSeat.seat.seat + ' (в.о.)',
            'emp': empSeat.employee.pip,
        } for empSeat in
            Employee_Seat.objects.only('id', 'seat', 'employee')
                .filter(employee__is_pc_user=True)
                .filter(is_active=True).order_by('employee__pip')]

        return HttpResponse(json.dumps(emp_seats))


@login_required(login_url='login')
def edms_get_chiefs(request, pk):
    emp_seat = get_object_or_404(Employee_Seat, pk=pk)
    seat_id = (Employee_Seat.objects.only('seat_id').filter(id=emp_seat.pk).first()).seat_id
    if request.method == 'GET':
        chiefs_list = get_chiefs_list(seat_id)
        # Перевертаємо список шефів (якщо він є), щоб директор був перший у списку (для автоматичного вибору у select)
        if chiefs_list:
            chiefs_list.reverse()
        return HttpResponse(json.dumps(chiefs_list))


@login_required(login_url='login')
def edms_get_direct_subs(request, pk):
    if request.method == 'GET':
        emp_seat = get_object_or_404(Employee_Seat, pk=pk)
        seat_id = (Employee_Seat.objects.only('seat_id').filter(id=emp_seat.pk).first()).seat_id
        direct_subs = [{
            'id': empSeat.id,
            'name': empSeat.employee.pip,
            'seat': empSeat.seat.seat,
            'is_active': True,
        } for empSeat in Employee_Seat.objects.filter(seat__chief_id=seat_id).filter(is_active=True)]  # Знаходимо підлеглих посади
        return HttpResponse(json.dumps(direct_subs))


@login_required(login_url='login')
def edms_get_doc(request, pk):
    doc = get_object_or_404(Document, pk=pk)
    if request.method == 'GET':
        # Всю інформацію про документ записуємо сюди
        doc_info = {}

        # Шукаємо path i flow документа, якщо це не чернетка:
        if not doc.is_draft:
            path = [{
                'id': path.id,
                'time': convert_to_localtime(path.timestamp, 'time'),
                'mark_id': path.mark_id,
                'mark': path.mark.mark,
                'emp_seat_id': path.employee_seat_id,
                'emp': path.employee_seat.employee.pip,
                'seat': path.employee_seat.seat.seat if path.employee_seat.is_main else '(в.о.) ' + path.employee_seat.seat.seat,
                'comment': path.comment,
            } for path in Document_Path.objects.filter(document_id=doc.pk).order_by('-timestamp')]

            # Перебираємо шлях документа в пошуках резолюцій чи "на ознайомлення" і додаємо їх до запису в path
            for step in path:
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

            # Перебираємо шлях документа в пошуках файлів і додаємо їх до відповідного запису в path
            for step in path:
                files = [{
                    'id': file.id,
                    'file': file.file.name,
                    'name': file.name,
                    'path_id': file.document_path.id,
                    'mark_id': file.document_path.mark.id,
                } for file in File.objects.filter(document_path_id=step['id'])]
                step['files'] = files

            doc_info.update({'path': path})

            # В кого на черзі документ:
            flow_all = [{
                'id': demand.id,
                'emp_seat_id': demand.recipient.id,
                'emp': demand.recipient.employee.pip,
                'seat': demand.recipient.seat.seat if demand.recipient.is_main else '(в.о.) ' + demand.recipient.seat.seat,
                'expected_mark': demand.mark_id,
            } for demand in Mark_Demand.objects.filter(document_id=doc.pk).filter(is_active=True)]

            # Розділяємо чергу на два потоки: "На ознайомлення" та "На черзі у"
            flow = []
            acquaints = []

            for step in flow_all:
                if step['expected_mark'] == 8:
                    acquaints.append(step)
                else:
                    flow.append(step)

            if flow:
                doc_info.update({'flow': flow})

            if acquaints:
                doc_info.update({'acquaints': acquaints})

        # отримуємо з бд список модулів, які використовує цей тип документа:
        type_modules = [{
            'module': type_module.module.module,
            'field_name': None if type_module.field_name is None else type_module.field_name,
        } for type_module in Document_Type_Module.objects
            .filter(document_type_id=doc.document_type_id)
            .filter(is_active=True)
            .order_by('queue')]
        doc_info.update({
            'type_modules': type_modules,
        })

        # збираємо з використовуваних модулів інфу про документ
        for module in type_modules:
            if module['module'] == 'name':
                name = [{
                    'name': item.name,
                } for item in Doc_Name.objects.filter(document_id=doc.id).filter(is_active=True)]

                if name:
                    doc_info.update({
                        'name': name[0]['name'],
                    })
            elif module['module'] == 'preamble':
                test = 'test'
            elif module['module'] == 'text':
                text = [{
                    'text': item.text,
                } for item in Doc_Text.objects.filter(document_id=doc.id).filter(is_active=True)]

                if text:
                    doc_info.update({
                        'text': text[0]['text'],
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
                    doc_info.update({
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
                    doc_info.update({
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
                doc_info.update({'acquaint_list': acquaint_list})
            elif module['module'] == 'files':
                files = [{
                    'id': file.id,
                    'file': file.file.name,
                    'name': file.name,
                    'path_id': file.document_path.id,
                    'mark_id': file.document_path.mark.id,
                } for file in File.objects
                    .filter(document_path__document_id=doc.id)
                    .filter(Q(document_path__mark=1) | Q(document_path__mark=16))]
                doc_info.update({
                    'old_files': files
                })
            elif module['module'] == 'day':
                day = [{
                    'day': datetime.strftime(item.day, '%Y-%m-%d'),
                } for item in Doc_Day.objects.filter(document_id=doc.id).filter(is_active=True)]

                if day:
                    doc_info.update({
                        'day': day[0]['day'],
                    })
            elif module['module'] == 'gate':
                gate = [{
                    'gate': item.gate,
                } for item in Doc_Gate.objects.filter(document_id=doc.id).filter(is_active=True)]

                if gate:
                    doc_info.update({
                        'gate': gate[0]['gate'],
                    })
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

                        doc_info.update({'carry_out_items': items_indexed})

        return HttpResponse(json.dumps(doc_info))


@transaction.atomic
@login_required(login_url='login')
def edms_my_docs(request):
    try:
        if request.method == 'GET':

            my_seats = get_my_seats(request.user.userprofile.id)

            new_docs_query = Document_Type.objects.all()

            # Якщо параметр testing = False - програма показує лише ті типи документів, які не тестуються.
            if not testing:
                new_docs_query = new_docs_query.filter(testing=False)

            new_docs = [{  # Список документів, які може створити юзер
                'id': doc_type.id,
                'description': doc_type.description,
            } for doc_type in new_docs_query]  # В режимі тестування показуються типи документів, що тестуються

            my_docs = [{  # Список документів, створених даним юзером
                'id': path.document.id,
                'type': path.document.document_type.description,
                'type_id': path.document.document_type.id,
                'date': convert_to_localtime(path.timestamp, 'day'),
                'emp_seat_id': path.employee_seat.id,
                'author': request.user.userprofile.pip,
                'author_seat_id': path.employee_seat.id,
            } for path in Document_Path.objects.filter(mark=1)
                .filter(employee_seat__employee_id=request.user.userprofile.id)
                .filter(document__testing=testing)
                .filter(document__is_active=True)
                .filter(document__closed=False)]

            work_docs = [{  # Список документів, що очікують на реакцію користувача
                'id': demand.document.id,
                'type': demand.document.document_type.description,
                'type_id': demand.document.document_type_id,
                'flow_id': demand.id,
                'date': convert_to_localtime(demand.document.date, 'day'),
                'emp_seat_id': demand.recipient.id,
                'expected_mark': demand.mark.id,
                'author': demand.document.employee_seat.employee.pip,
                'author_seat_id': demand.document.employee_seat_id,
                'mark_demand_id': demand.id,
                'phase_id': demand.phase_id,
            } for demand in Mark_Demand.objects
                .filter(recipient_id__employee_id=request.user.userprofile.id)
                .filter(document__testing=testing)
                .filter(is_active=True).filter(document__closed=False)
                .order_by('document_id')]

            return render(request, 'edms/my_docs/my_docs.html', {
                'new_docs': new_docs, 'my_docs': my_docs, 'my_seats': my_seats, 'work_docs': work_docs
            })

        elif request.method == 'POST':
            doc_request = request.POST.copy()
            doc_files = request.FILES.copy()

            # Записуємо документ і отримуємо його ід
            new_doc = post_document(request)
            doc_request.update({'document': new_doc.pk})

            # В залежності від того чи це чернетка, записуємо перший path_id з позначкою 1 або 16:
            if doc_request['is_draft'] == 'false':
                doc_request.update({'mark': 1})
            else:
                doc_request.update({'mark': 16})

            doc_request.update({'comment': ''})

            # Записуємо перший крок шляху документа і отримуємо його ід
            new_path = post_path(doc_request)
            doc_request.update({'document_path': new_path.pk})

            # Модульна система:
            # В деяких модулях прямо може бути вказано отримувачів,
            # тому post_modules повертає їх в array, який може бути і пустий
            module_recipients = post_modules(doc_request, doc_files, new_path)

            if doc_request['is_draft'] == 'false':
                new_phase(doc_request, 1, module_recipients)

            # Деактивуємо стару чернетку
            if doc_request['old_draft_id'] != '0':
                delete_doc(doc_request, int(doc_request['old_draft_id']))

            # (Відправляємо листи отримувачам з модулів) -
            # тепер направляємо список отримувачів у new_phase, звідки направляємо листи
            # if doc_request['is_draft'] == 'false' and module_recipients:
            #     send_email('new', module_recipients, doc_request['document'])

            return HttpResponse(new_doc.pk)
    except ValidationError as err:
        raise err
        # return HttpResponse(status=405, content=err)
    except Exception as err:
        raise err
        # return HttpResponse(status=405, content=err)


@login_required(login_url='login')
def edms_get_doc_type_modules(request, pk):
    if request.method == 'GET':
        doc_type = get_object_or_404(Document_Type, pk=pk)

        doc_type_modules_query = Document_Type_Module.objects.filter(document_type_id=doc_type) \
            .filter(is_active=True).order_by('queue')

        if not testing:
            doc_type_modules_query = doc_type_modules_query.filter(testing=False)

        doc_type_modules = [{
            'id': type_module.id,
            'module': type_module.module.module,
            'field_name': None if type_module.field_name is None else type_module.field_name,
            'required': type_module.required,
        } for type_module in doc_type_modules_query]

        return HttpResponse(json.dumps(doc_type_modules))


@login_required(login_url='login')
def edms_get_drafts(request):
    try:
        if request.method == 'GET':
            my_drafts = [{  # Список документів, створених даним юзером
                'id': draft.id,
                'type': draft.document_type.description,
                'type_id': draft.document_type.id,
                'date': convert_to_localtime(draft.date, 'day'),
            } for draft in Document.objects\
                .filter(employee_seat__employee_id=request.user.userprofile.id)
                .filter(is_draft=True)
                .filter(testing=testing)
                .filter(closed=False)]

            response = my_drafts if len(my_drafts) > 0 else []

            return HttpResponse(json.dumps(response))
    except Exception as err:
        return HttpResponse(status=405, content=err)


@login_required(login_url='login')
def edms_del_draft(request, pk):
    try:
        if request.method == 'POST':
            delete_doc(request.POST.copy(), pk)
            return HttpResponse(pk)
    except Exception as err:
        return HttpResponse(status=405, content=err)


@login_required(login_url='login')
def edms_archive(request):
    if request.method == 'GET':
        my_seats = get_my_seats(request.user.userprofile.id)

        my_archive = [{  # Список документів, створених даним юзером
            'id': path.document.id,
            'type': path.document.document_type.description,
            'type_id': path.document.document_type.id,
            'date': convert_to_localtime(path.timestamp, 'day'),
            'emp_seat_id': path.employee_seat.id,
            'author': path.document.employee_seat.employee.pip,
            'author_seat_id': path.employee_seat.id,
        } for path in Document_Path.objects.filter(mark=1)
            .filter(mark=1).filter(employee_seat__employee_id=request.user.userprofile.id)
            .filter(document__testing=testing)
            .filter(document__is_active=False)
            .filter(document__closed=False)]

        work_archive_with_duplicates = [{  # Список документів, які були у роботі користувача
            'id': path.document_id,
            'type': path.document.document_type.description,
            'type_id': path.document.document_type_id,
            'date': convert_to_localtime(path.document.date, 'day'),
            'emp_seat_id': path.employee_seat_id,
            'author': path.document.employee_seat.employee.pip,
            'author_seat_id': path.document.employee_seat_id,
        } for path in Document_Path.objects.distinct()
            .filter(employee_seat_id__employee_id=request.user.userprofile.id)
            .filter(document__testing=testing)
            .filter(document__closed=False)
            .exclude(document__employee_seat__employee=request.user.userprofile.id)]

        # Позбавляємось дублікатів:
        work_archive = list({item["id"]: item for item in work_archive_with_duplicates}.values())

        return render(request, 'edms/archive/archive.html', {
            'my_seats': my_seats, 'my_archive': my_archive, 'work_archive': work_archive,
        })
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_sub_docs(request):
    if request.method == 'GET':
        my_seats = get_my_seats(request.user.userprofile.id)

        return render(request, 'edms/sub_docs/sub_docs.html', {
            'my_seats': my_seats,
        })
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_get_sub_docs(request, pk):
    if request.method == 'GET':
        # Отримуємо ід посади з ід людинопосади
        seat_id = Employee_Seat.objects.filter(id=pk).values_list('seat_id')[0][0]

        # Список всіх підлеглих користувача:
        subs_list = get_subs_list(int(seat_id))

        # Шукаємо документи кожного підлеглого
        sub_docs = []
        if subs_list:
            for sub in subs_list:

                docs = [{  # Список документів у роботі, створених підлеглими юзера
                    'id': path.document_id,
                    'type': path.document.document_type.description,
                    'type_id': path.document.document_type_id,
                    'date': datetime.strftime(path.timestamp, '%d.%m.%Y'),
                    'author_seat_id': path.employee_seat_id,
                    'author': path.employee_seat.employee.pip,
                    'dep': path.employee_seat.seat.department.name,
                    'emp_seat_id': int(pk),
                    'is_active': path.document.is_active,
                } for path in Document_Path.objects
                    .filter(mark_id=1)
                    .filter(employee_seat__seat_id=sub['id'])
                    .filter(document__testing=testing)
                    .filter(document__closed=False)]

                if docs:
                    for doc in docs:
                        sub_docs.append(doc)
        return HttpResponse(json.dumps(sub_docs))

    return HttpResponse(status=405)


@transaction.atomic
@login_required(login_url='login')
def edms_mark(request):
    try:
        if request.method == 'POST':
            # Якщо документ намагаються видалити, шукаємо, чи хтось не відреагував на нього
            # Якщо позначки від інших користувачів є - відмовляємо у видаленні
            if request.POST['mark'] == '13':
                deletable = Document_Path.objects \
                    .filter(document_id=request.POST['document']) \
                    .exclude(employee_seat_id=request.POST['employee_seat'])
                if len(deletable) > 0:
                    return HttpResponse('not deletable')

            path_form = DocumentPathForm(request.POST)
            if path_form.is_valid():
                new_path = path_form.save()
                doc_request = request.POST.copy()
                doc_request.update({'document_path': new_path.pk})
            else:
                raise ValidationError('view edms_mark: path_form invalid')

            doc_type = Document.objects.values_list('document_type', flat=True).filter(id=doc_request['document'])
            doc_request.update({'document_type': doc_type[0]})

            # Погоджую, Ознайомлений, Доопрацьовано, Виконано, Підписано
            if int(doc_request['mark']) in [2, 9, 11, 14]:
                # Деактивуємо MarkDemand цієї позначки
                deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])

                # Отримуємо список необхідних (required) позначок на даній фазі, які ще не виконані
                # Якщо таких немає, переходимо до наступної фази.
                remaining_required_md = Mark_Demand.objects.filter(document_id=doc_request['document'])\
                    .filter(phase_id=doc_request['phase_id'])\
                    .filter(phase__required=True)\
                    .filter(is_active=True)\
                    .count()

                if remaining_required_md == 0:
                    this_phase = Mark_Demand.objects.values_list('phase__phase', flat=True) \
                        .filter(id=doc_request['mark_demand_id'])[0]
                    new_phase(doc_request, this_phase + 1, [])

            # Відмовлено
            elif doc_request['mark'] == '3':
                # Деактивуємо всі MarkDemands даної фази
                deactivate_doc_mark_demands(doc_request, int(doc_request['document']))

            # На доопрацювання
            elif doc_request['mark'] == '5':
                # Деактивуємо всі MarkDemands даної фази, перетворюємо документ на чернетку
                test = 'test'

            # Не заперечую
            elif doc_request['mark'] == '6':
                # Деактивуємо MarkDemand цієї позначки
                deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])

                # Отримуємо порядковий номер поточної фази та ід позначки, яка використовується у цій фазі
                this_phase = Mark_Demand.objects.values('phase__phase', 'phase__mark_id') \
                    .filter(id=doc_request['mark_demand_id'])[0]

                this_phase_number = this_phase['phase__phase']
                this_phase_mark = this_phase['phase__mark_id']

                # Якщо у даній фазі вимагається позначка 2, значить треба передати документ далі по ланці керівників
                if this_phase_mark == 2:
                    doc_recipient = Doc_Recipient.objects.values_list('recipient_id', flat=True) \
                        .filter(document_id=doc_request['document']) \
                        .filter(is_active=True)
                    new_phase(doc_request, this_phase_number, [{'id': doc_recipient[0], 'type': 'chief'}])
                else:
                    # Якщо всі необхідні позначки проставлені, відправляємо документ у наступну фазу
                    remaining_required_md = Mark_Demand.objects.filter(document_id=doc_request['document']) \
                        .filter(phase_id=doc_request['phase_id']) \
                        .filter(phase__required=True) \
                        .filter(is_active=True) \
                        .count()

                    if remaining_required_md == 0:
                        new_phase(doc_request, this_phase_number + 1, [])

            # Закрито
            elif doc_request['mark'] == '7':
                post_mark_deactivate(doc_request)

            # Ознайомлений
            elif doc_request['mark'] == '8':
                deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])

            # Резолюція
            elif doc_request['mark'] == '10':
                # Деактивуємо MarkDemand цієї позначки
                deactivate_mark_demand(doc_request, doc_request['mark_demand_id'])
                # Створюємо MarkDemand для кожної резолюції з незмінною фазою:
                resolutions = json.loads(doc_request['resolutions'])
                for resolution in resolutions:
                    doc_request.update({'comment': resolution['comment']})
                    post_mark_demand(doc_request, resolution['recipient_id'], doc_request['phase_id'], 11)
                    send_email('new', [{'id': resolution['recipient_id']}], doc_request['document'])

            # Видалено
            elif doc_request['mark'] == '13':
                deletable = Document_Path.objects \
                    .filter(document_id=doc_request['document']) \
                    .exclude(employee_seat_id=doc_request['employee_seat'])
                if len(deletable) > 0:
                    return HttpResponse('not deletable')
                else:
                    post_mark_delete(doc_request)

            # На ознайомлення
            elif doc_request['mark'] == '15':
                acquaints = json.loads(doc_request['acquaints'])
                # Створюємо MarkDemand для кожного користувача зі списку, більше нічого не змінюємо.
                # Якщо phase_id = 0, то на ознайомлення відправляє автор, тому браузер не знає ід фази. Знаходимо її.
                phase = doc_request['phase_id']
                if phase == '0':
                    phase = Doc_Type_Phase.objects.values_list('id', flat=True) \
                        .filter(document_type_id=doc_request['document_type']) \
                        .filter(phase=0) \
                        .filter(is_active=True)

                for acquaint in acquaints:
                    post_mark_demand(doc_request, acquaint['emp_seat_id'], phase[0], 8)
                    send_email('new', [{'id': acquaint['emp_seat_id']}], doc_request['document'])

            # Додаємо файли, якщо такі є:
            doc_request = request.POST.copy()
            handle_files(request.FILES, doc_request, new_path.pk)

            # Надсилаємо листа автору документа:
            doc_author = Document.objects.values_list('employee_seat_id', flat=True). filter(id=doc_request['document'])[0]
            if int(doc_request['employee_seat']) != doc_author:
                send_email('mark', [{'id': doc_author}], doc_request['document'])

            return HttpResponse(new_path.pk)
    except ValidationError as err:
        raise err
    except Exception as err:
        raise err


# @login_required(login_url='login')
# def edms_resolution(request):
#     if request.method == 'POST':
#
#         # отримуємо список резолюцій з request і публікуємо їх усі у базу
#         resolutions = json.loads(request.POST['resolutions'])
#         res_request = request.POST.copy()
#         for res in resolutions:
#             res_request.update({'recipient': res['recipient_id']})
#             res_request.update({'comment': res['comment']})
#             resolution_form = ResolutionForm(res_request)
#             if resolution_form.is_valid():
#                 new_res = resolution_form.save()
#             else:
#                 return HttpResponse(status=405)
#         return HttpResponse('')


@login_required(login_url='login')
def edms_get_deps(request):
    if request.method == 'GET':
        return HttpResponse(json.dumps(get_deps()))
    return HttpResponse(status=405)


@login_required(login_url='login')
def edms_get_seats(request):
    if request.method == 'GET':
        return HttpResponse(json.dumps(get_seats()))
    return HttpResponse(status=405)
