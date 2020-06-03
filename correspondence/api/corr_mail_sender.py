from plxk.api.mail_sender import send_email
from correspondence.models import Request
from accounts.models import UserProfile
from django.conf import settings

testing = settings.STAS_DEBUG


def create_mail_body(post_request, mail, req_type):
    subject = "Додано новий запит клієнта" if req_type == 'new' else "Запит клієнта змінено"

    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/correspondence/corr/{}' \
        .format(post_request['request'])

    if req_type == 'new':
        text = 'На сайті ПЛХК опубліковано новий запит клієнта. {}.'.format(link)
    else:
        text = 'На сайті ПЛХК відредаговано запит клієнта. {}.'.format(link)

    body = u"\r\n".join((
        "From: it@lxk.com.ua",
        "To: " + mail,
        "Subject: " + subject,
        "",
        text
    )).encode('cp1251').strip()

    return body


def send_mails(post_request, req_type):
    correspondence_mail_query_list = list(UserProfile.objects.values_list('user__email').filter(is_correspondence_mail=True))
    correspondence_mail_list = list(sum(correspondence_mail_query_list, ()))

    author_mail = Request.objects.values_list('added_by__email', flat=True).filter(id=post_request['request'])[0]
    responsible_mail = Request.objects.values_list('responsible__email', flat=True).filter(id=post_request['request'])[0]
    answer_responsible_mail = Request.objects.values_list('responsible_id__email', flat=True).filter(id=post_request['request'])[0]

    mails = [author_mail, responsible_mail, answer_responsible_mail] + correspondence_mail_list

    mails_without_duplicates = list(dict.fromkeys(mails))

    if not testing:
        for mail in mails_without_duplicates:
            body = create_mail_body(post_request, mail, req_type)
            send_email(mail, body)
