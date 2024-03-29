from plxk.api.mail_sender import send_email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.shortcuts import get_object_or_404
from edms.models import Document


# Складаємо лист новому отримувачу документа EDMS
def send_email_new(doc_request, mail, main_field):
    message = MIMEMultipart("alternative")
    message["Subject"] = 'Новий електронний документ – {} "{}"'.format(doc_request['doc_type_name'], main_field)
    message["From"] = 'it@lxk.com.ua'
    message["To"] = mail

    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/edms/my_docs/{}' \
        .format(doc_request['document'])
    text = 'Вашої реакції очікує новий документ ({} "{}", автор: {}). \n\n{}' \
        .format(doc_request['doc_type_name'], main_field, doc_request['doc_author_name'], link)

    message.attach(MIMEText(text, "plain"))

    send_email(mail, message.as_string())


# Тимчасова функція для відправлення Лебедєву листів про створення нових документів
def send_email_lebedev(doc_request, main_field):
    message = MIMEMultipart("alternative")
    message["Subject"] = 'Новий електронний документ – {} "{}"'.format(doc_request['doc_type_name'], main_field)
    message["From"] = 'it@lxk.com.ua'
    message["To"] = 'lebedev.oo@lxk.com.ua'

    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/edms/my_docs/{}' \
        .format(doc_request['document'])
    text = 'На сайті створено новий документ ({} "{}", автор: {}). \n\n{}' \
        .format(doc_request['doc_type_name'], main_field, doc_request['doc_author_name'], link)

    message.attach(MIMEText(text, "plain"))

    send_email('lebedev.oo@lxk.com.ua', message.as_string())


def send_test_email():
    message = MIMEMultipart("alternative")
    message["Subject"] = 'Тест'
    message["From"] = 'it@lxk.com.ua'
    message["To"] = 'sauron4er@gmail.com'

    text = 'Тестове повідомлення'

    message.attach(MIMEText(text, "plain"))

    send_email('sauron4er@gmail.com', message.as_string())


# Складаємо лист автору документа про нову позначку EDMS:
def send_email_mark(doc_request, mail, main_field):
    message = MIMEMultipart("alternative")
    message["Subject"] = 'Нова реакція на Ваш електронний документ – {} "{}"'.format(doc_request['doc_type_name'], main_field)
    message["From"] = 'it@lxk.com.ua'
    message["To"] = mail

    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/edms/my_docs/{}' \
        .format(doc_request['document'])
    text = 'Ваш документ #{} ({}) отримав позначку "{}". Автор позначки: {}. \n\n{}' \
        .format(doc_request['document'], doc_request['doc_type_name'],
                doc_request['mark_name'], doc_request['mark_author_name'], link)

    message.attach(MIMEText(text, "plain"))

    send_email(mail, message.as_string())


# Лист автору оригінального коментарю про отримання відповіді:
def send_email_answer(doc_request, mail):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Ви отримали відповідь на коментар"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = mail

    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/edms/my_docs/{}' \
        .format(doc_request['document'])
    text = 'Ви отримали відповідь на коментар до документу № {} ({}). \n\n{}' \
        .format(doc_request['document'], doc_request['doc_type_name'], link)

    message.attach(MIMEText(text, "plain"))

    send_email(mail, message.as_string())


# Лист візуючому про видалення зі списку візуючих:
def send_email_deleted_from_approvals(doc_request, mail, main_field):
    message = MIMEMultipart("alternative")
    message["Subject"] = 'Вас видалено зі списку візуючих ({} "{}")'.format(doc_request['doc_type_name'], main_field)
    message["From"] = 'it@lxk.com.ua'
    message["To"] = mail

    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/edms/my_docs/{}' \
        .format(doc_request['document'])
    text = 'Вас видалили зі списку візуючих щодо документу № {} ({} "{}"). \n\n{}' \
        .format(doc_request['document'], doc_request['doc_type_name'], main_field, link)

    message.attach(MIMEText(text, "plain"))

    send_email(mail, message.as_string())


# Лист щодо створення нового документа особі, яка має доступ до перегляду всіх таких документів.
# Наприклад Терещенко і заявки по 1С8:
def send_email_supervisor(stage, doc_request, mail):
    document_instance = get_object_or_404(Document, pk=doc_request['document'])

    message = MIMEMultipart("alternative")
    message["Subject"] = "Створена нова заявка по 1С8. {}" if stage == 'new' \
        else 'Змінився статус заявки по 1С8 "{}" ({})'.format(document_instance.main_field, stage)
    message["From"] = 'it@lxk.com.ua'
    message["To"] = mail

    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/edms/my_docs/{}' \
        .format(doc_request['document'])

    if stage == 'new':
        text = 'На внутрішньому сайті ПЛХК опубліковано нову заявку по 1С8 № {} "{}". Автор: {}. \n\n{}' \
            .format(doc_request['document'], document_instance.main_field, doc_request['doc_author_name'], link)
    else:
        text = 'Новий статус заявки по 1С8 № {} "{}" (автор: {}) – "{}". \n\n{}' \
            .format(doc_request['document'], document_instance.main_field, doc_request['doc_author_name'], stage, link)

    message.attach(MIMEText(text, "plain"))

    send_email(mail, message.as_string())


# Лист працівнику, який отримав посаду у спадок або в/о під час відпустки:
def send_email_successor(doc_request, mail):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Ви отримали відповідь на коментар"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = mail

    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/edms/my_docs/{}' \
        .format(doc_request['document'])
    text = 'Ви отримали відповідь на коментар до документу № {} ({}). \n\n{}' \
        .format(doc_request['document'], doc_request['doc_type_name'], link)

    message.attach(MIMEText(text, "plain"))

    send_email(mail, message.as_string())


# Лист-нагадування про візування чи виконання
def send_email_remind(doc_request, mail, main_field):
    message = MIMEMultipart("alternative")
    message["Subject"] = 'Нагадування про візування/виконання – {} "{}"'.format(doc_request['doc_type_name'], main_field)
    message["From"] = 'it@lxk.com.ua'
    message["To"] = mail

    main_text = 'Нагадуємо, Вашої реакції очікує документ ({} "{}", автор: {}).'\
        .format(doc_request['doc_type_name'], main_field, doc_request['doc_author_name'])

    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/edms/my_docs/{}.' \
        .format(doc_request['document'])

    deadline = 'Строк візування/виконання, визначений автором, закінчується {}.'.format(doc_request['deadline'])

    text = '{}\n\n{}\n\n{}'.format(main_text, deadline, link)

    message.attach(MIMEText(text, "plain"))

    send_email(mail, message.as_string())
