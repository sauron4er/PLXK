from plxk.api.mail_sender import send_email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .getters import get_main_field
from django.shortcuts import get_object_or_404
from edms.models import Document


# Складаємо лист новому отримувачу документа EDMS
def send_email_new(doc_request, mail):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Новий електронний документ"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = mail

    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/edms/my_docs/{}' \
        .format(doc_request['document'])
    text = 'Вашої реакції очікує новий документ ({}, автор: {}). {}' \
        .format(doc_request['doc_type_name'], doc_request['doc_author_name'], link)

    message.attach(MIMEText(text, "plain"))

    send_email(mail, message.as_string())


# Складаємо лист автору документа про нову позначку EDMS:
def send_email_mark(doc_request, mail):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Нова реакція на Ваш електронний документ"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = mail

    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/edms/my_docs/{}' \
        .format(doc_request['document'])
    text = 'Ваш документ #{} ({}) отримав позначку "{}". Автор позначки: {}. {}' \
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
    text = 'Ви отримали відповідь на коментар до документу № {} ({}). {}' \
        .format(doc_request['document'], doc_request['doc_type_name'], link)

    message.attach(MIMEText(text, "plain"))

    send_email(mail, message.as_string())


# Лист щодо створення нового документа особі, яка має доступ до перегляду всіх таких документів.
# Наприклад Терещенко і заявки по 1С8:
def send_email_supervisor(stage, doc_request, mail):
    document_instance = get_object_or_404(Document, pk=doc_request['document'])
    main_field = get_main_field(document_instance)

    message = MIMEMultipart("alternative")
    message["Subject"] = "Створена нова заявка по 1С8. {}" if stage == 'new' \
        else 'Змінився статус заявки по 1С8 "{}" ({})'.format(main_field, stage)
    message["From"] = 'it@lxk.com.ua'
    message["To"] = mail

    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/edms/my_docs/{}' \
        .format(doc_request['document'])

    if stage == 'new':
        text = 'На внутрішньому сайті ПЛХК опубліковано нову заявку по 1С8 № {} "{}". Автор: {}. {}' \
            .format(doc_request['document'], main_field, doc_request['doc_author_name'], link)
    else:
        text = 'Новий статус заявки по 1С8 № {} "{}" (автор: {}) – "{}". {}' \
            .format(doc_request['document'], main_field, doc_request['doc_author_name'], stage, link)

    message.attach(MIMEText(text, "plain"))

    send_email(mail, message.as_string())
