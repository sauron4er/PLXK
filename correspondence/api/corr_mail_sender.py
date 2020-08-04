import json
from plxk.api.mail_sender import send_email
from plxk.api.global_getters import get_user_mail
from correspondence.models import Request
from accounts.models import UserProfile
from django.conf import settings
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

testing = settings.STAS_DEBUG


def create_mail_body(post_request, mail, req_type):
    message = MIMEMultipart("alternative")
    if req_type == 'new':
        message["Subject"] = "На сайті ПЛХК додано новий запит клієнта"
    elif req_type == 'edit':
        message["Subject"] = "Запит клієнта на сайті ПЛХК змінено"
    else:  # 'acquaint'
        message["Subject"] = "Вам запропоновано ознайомитися з запитом клієнта на сайті ПЛХК"

    message["From"] = 'it@lxk.com.ua'
    message["To"] = mail

    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/correspondence/corr/{}' \
        .format(post_request['request'])

    if req_type == 'new':
        text = 'На сайті ПЛХК опубліковано новий запит клієнта. {}.'.format(link)
    elif req_type == 'edit':
        text = 'На сайті ПЛХК відредаговано запит клієнта. {}.'.format(link)
    else:  # 'acquaint'
        text = 'Вас додано в список осіб для ознайомлення з запитом клієнта на сайті ПЛХК. {}.'.format(link)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def send_mails(post_request, req_type):
    if not testing:
        correspondence_mail_query_list = list(UserProfile.objects.values_list('user__email').filter(is_correspondence_mail=True))
        correspondence_mail_list = list(sum(correspondence_mail_query_list, ()))

        author_mail = Request.objects.values_list('added_by__email', flat=True).filter(id=post_request['request'])[0]
        responsible_mail = Request.objects.values_list('responsible__email', flat=True).filter(id=post_request['request'])[0]
        answer_responsible_mail = Request.objects.values_list('responsible_id__email', flat=True).filter(id=post_request['request'])[0]

        mails = correspondence_mail_list + [author_mail, responsible_mail, answer_responsible_mail, 'sales@lxk.com.ua']

        mails_without_duplicates = list(dict.fromkeys(mails))

        for mail in mails_without_duplicates:
            body = create_mail_body(post_request, mail, req_type)
            send_email(mail, body)


def send_acquaints_mails(post_request):
    if not testing:
        acquaints = json.loads(post_request['acquaints'])
        acquaints_mails = []
        for acquaint in acquaints:
            if acquaint['status'] == 'new':
                acquaints_mails.append(get_user_mail(acquaint['id']))

        for mail in acquaints_mails:
            body = create_mail_body(post_request, mail, 'acquaint')
            send_email(mail, body)
