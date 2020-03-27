from django.contrib.auth.models import User
from django.conf import settings
from plxk.api.mail_sender import send_email
from docs.models import File
import json


testing = settings.STAS_DEBUG


def create_mail_body(post_request, mail):
    subject = "Опубліковано {} № {}".format(post_request['type_name'], post_request['code'])
    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/docs/orders/{}' \
        .format(post_request['id'])

    file = File.objects.values_list('file', flat=True).filter(order_id=post_request['id'])[0]
    download = 'Щоб скачати документ, натисніть на посилання: http://10.10.10.22/media/{}'.format(file)

    text = 'На сайті plhk.com.ua опубліковано {} №{} "{}". {}.\r\n{}' \
        .format(post_request['type_name'], post_request['code'], post_request['name'], link, download)

    body = u"\r\n".join((
        "From: it@lxk.com.ua",
        "To: " + mail,
        "Subject: " + subject,
        "",
        text
    )).encode('cp1251').strip()

    return body


def send_mails_default(post_request):
    author_mail = User.objects.values_list('email', flat=True).filter(id=post_request['author'])[0]
    responsible_mail = User.objects.values_list('email', flat=True).filter(id=post_request['responsible'])[0]
    supervisory_mail = User.objects.values_list('email', flat=True).filter(id=post_request['supervisory'])[0]

    author_body = create_mail_body(post_request, author_mail)
    responsible_body = create_mail_body(post_request, responsible_mail)
    supervisory_body = create_mail_body(post_request, supervisory_mail)

    if not testing:
        send_email(author_mail, author_body)
        send_email(responsible_mail, responsible_body)
        send_email(supervisory_mail, supervisory_body)


def send_mails_everyone(post_request):
    mail = 'all_users@lxk.com.ua'
    body = create_mail_body(post_request, mail)

    if not testing:
        send_email(mail, body)


def send_mails_list(post_request):
    receivers = json.loads(post_request['mail_list'])
    for receiver in receivers:
        mail = User.objects.values_list('email', flat=True).filter(id=receiver['id'])[0]
        body = create_mail_body(post_request, mail)
        if not testing:
            send_email(mail, body)


def arrange_mail(post_request):
    if post_request['mail_mode'] == 'to_default':
        send_mails_default(post_request)
    elif post_request['mail_mode'] == 'everyone':
        send_mails_everyone(post_request)
    elif post_request['mail_mode'] == 'list':
        send_mails_list(post_request)
        send_mails_default(post_request)
