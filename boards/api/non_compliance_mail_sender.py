from accounts.models import UserProfile
from plxk.api.mail_sender import send_email
from django.conf import settings
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

testing = settings.STAS_DEBUG


def create_dep_chief_body(nc_id, address):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Новий акт невідповідності очікує вашого погодження"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = address

    text = 'Ваш підлеглий додав на сайт ПЛХК акт невідповідності. ' \
           'Необхідне ваше погодження для запуску цього акту в роботу' \
           'Переглянути можна на сторінці http://10.10.10.22/boards/non_compliances/{}'\
        .format(nc_id)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def create_decisioner_body(nc_id, address):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Новий акт невідповідності на внутрішньому сайті"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = address

    text = 'Вашого рішення очікує новий акт невідповідності. ' \
           'Переглянути можна на сторінці http://10.10.10.22/boards/non_compliances/{}' \
        .format(nc_id)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def create_author_body(nc_id, address):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Нова реакція на опублікований вами акт невідповідності"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = address

    text = 'Нові відмітки у вашому акті невідповідності.' \
           'Переглянути можна на сторінці http://10.10.10.22/boards/non_compliances/{}' \
        .format(nc_id)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def create_answer_body(nc_id, address):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Відповідь на коментар щодо акту невідповідності"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = address

    text = 'Ви отримали відповідь на коментар щодо акту невідповідності.' \
           'Переглянути можна на сторінці http://10.10.10.22/boards/non_compliances/{}' \
        .format(nc_id)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def create_and_send_mail(type, recipient_userprofile_id, nc_id):
    if not testing:
        address = UserProfile.objects.values_list('user__email', flat=True).filter(id=recipient_userprofile_id)[0]
        if type == 'dep_chief':
            body = create_dep_chief_body(nc_id, address)
        elif type == 'decisioner':
            body = create_dep_chief_body(nc_id, address)
        elif type == 'answer':
            body = create_answer_body(nc_id, address)
        else:
            body = create_author_body(nc_id, address)
        send_email(address, body)
