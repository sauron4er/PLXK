from accounts.models import UserProfile
from plxk.api.mail_sender import send_email
from django.conf import settings
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

testing = settings.STAS_DEBUG


def create_new_mail_body(provider, address):
    message = MIMEMultipart("alternative")
    message["Subject"] = "На сайт ПЛХК додано нового постачальника - {}".format(provider.name)
    message["From"] = 'it@lxk.com.ua'
    message["To"] = address

    text = 'На сайт ПЛХК додано нового постачальника - {}. ' \
           'Переглянути можна на сторінці http://10.10.10.22/boards/providers'\
        .format(provider.name)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def create_change_mail_body(provider, address):
    message = MIMEMultipart("alternative")
    message["Subject"] = "На сайті ПЛХК змінено інформацію про постачальника - {}"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = address

    text = 'На сайті ПЛХК змінено інформацію про постачальника - {}. ' \
           'Переглянути зміни можна на сторінці http://10.10.10.22/boards/providers' \
        .format(provider.name)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def send_provider_mail(type, provider):
    addresses = UserProfile.objects.values_list('user__email', flat=True).filter(providers_add=True)
    if not testing:
        for address in addresses:
            if type == 'new':
                body = create_new_mail_body(provider, address)
            else:
                body = create_change_mail_body(provider, address)
            send_email(address, body)
