from accounts.models import UserProfile
from plxk.api.mail_sender import send_email
from django.conf import settings
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

testing = settings.STAS_DEBUG


def create_dep_chief_body(reclamation_id, address):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Нова рекламація очікує вашого погодження"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = address

    text = 'Ваш підлеглий додав на сайт ПЛХК рекламацію. ' \
           'Необхідне ваше погодження для запуску її в роботу' \
           'Переглянути можна на сторінці http://10.10.10.22/boards/reclamations/{}'\
        .format(reclamation_id)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def create_responsible_body(reclamation_id, address):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Нова рекламація очікує вашого погодження"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = address

    text = 'Вас призначено відповідальним за оформлення рішення комісії щодо рекламації. ' \
           'Переглянути можна на сторінці http://10.10.10.22/boards/reclamations/{}'\
        .format(reclamation_id)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def create_decisioner_body(reclamation_id, address):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Нова рекламація на внутрішньому сайті"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = address

    text = 'Вашого рішення очікує нова рекламація. ' \
           'Переглянути можна на сторінці http://10.10.10.22/boards/non_compliances/{}' \
        .format(reclamation_id)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def create_author_body(reclamation_id, address):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Нова реакція на опубліковану вами рекламацію"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = address

    text = 'Нові відмітки у вашій рекламації.' \
           'Переглянути можна на сторінці http://10.10.10.22/boards/reclamations/{}' \
        .format(reclamation_id)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def create_answer_body(reclamation_id, address):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Відповідь на коментар щодо рекламації"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = address

    text = 'Ви отримали відповідь на коментар щодо рекламації.' \
           'Переглянути можна на сторінці http://10.10.10.22/boards/reclamations/{}' \
        .format(reclamation_id)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def create_and_send_mail(type, recipient_userprofile_id, reclamation_id):
    if not testing:
        address = UserProfile.objects.values_list('user__email', flat=True).filter(id=recipient_userprofile_id)[0]
        if type == 'dep_chief':
            body = create_dep_chief_body(reclamation_id, address)
        elif type == 'decisioner':
            body = create_dep_chief_body(reclamation_id, address)
        elif type == 'answer':
            body = create_answer_body(reclamation_id, address)
        elif type == 'responsible':
            body = create_responsible_body(reclamation_id, address)
        else:
            body = create_author_body(reclamation_id, address)
        send_email(address, body)
