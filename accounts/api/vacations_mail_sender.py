from accounts.models import UserProfile
from plxk.api.mail_sender import send_email
from django.conf import settings
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import datetime

testing = settings.STAS_DEBUG


def create_acting_planned_mail_body(employee, begin, end, address):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Запланована відпустка, щодо якої вас обрано виконуючим обовязки"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = address

    text = 'У вашого колеги ({}) заплановано відпустку. Термін відпустки: з {} по {}. ' \
           'Вам буде назначено нову посаду і перенаправлено відповідні активні документи, якщо такі будуть.' \
        .format(employee, datetime.datetime.strftime(begin, '%d.%m.%Y'), datetime.datetime.strftime(end, '%d.%m.%Y'))

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def create_acting_begin_mail_body(employee, begin, end, address):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Вас обрано виконуючим обовязки під час відпустки колеги"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = address

    text = 'Почалася відпустка у вашого колеги: {}. Термін відпустки: з {} по {}. ' \
           'Вам назначено нову посаду і до вас на розгляд перенаправлено відповідні активні документи, якщо такі є. ' \
           'Щоб переглянути, перейдіть на сторінку http://10.10.10.22/edms/my_docs і оберіть необхідну посаду у верхньому правому куті.'\
        .format(employee, datetime.datetime.strftime(begin, '%d.%m.%Y'), datetime.datetime.strftime(end, '%d.%m.%Y'))

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def create_acting_changed_mail_body(employee, address):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Відпустка, щодо якої вас призначено виконуючим обовязки, змінилася"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = address

    text = 'Внесено зміни до відпустки вашого колеги: {}, щодо якої вас обрано виконуючим обовязки. ' \
           'Щоб переглянути зміни, перейдіть на сторінку http://10.10.10.22/accounts/vacations/' \
        .format(employee)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def create_acting_end_mail_body(employee, address):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Відпустка, щодо якої вас призначено виконуючим обовязки, закінчилася або відмінена"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = address

    text = 'Закінчилася або відмінена відпустка у вашого колеги: {}. ' \
           'З вас знято посаду в.о. і активні документи, що відносяться до неї.' \
        .format(employee)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def send_acting_mail(vacation, mail_type):
    address = 'khramtsov.sa@lxk.com.ua'
    if testing:
        if mail_type == 'planned':
            body = create_acting_planned_mail_body(vacation.employee.pip, vacation.begin, vacation.end, address)
        if mail_type == 'begin':
            body = create_acting_begin_mail_body(vacation.employee.pip, vacation.begin, vacation.end, address)
        if mail_type == 'changed':
            body = create_acting_changed_mail_body(vacation.employee.pip, address)
        else:
            body = create_acting_end_mail_body(vacation.employee.pip, address)
        send_email(address, body)
