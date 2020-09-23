from django.contrib.auth.models import User
import datetime
import json
from django.conf import settings
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from plxk.api.try_except import try_except
from plxk.api.mail_sender import send_email
from docs.models import File, Article_responsible, Order_article

testing = settings.STAS_DEBUG


def responsible_text(is_it_responsible):
    if is_it_responsible:
        return ', в якому вас зазначено відповідальною особою'
    return ''


@try_except
def create_mail_body(post_request, mail, is_it_responsible):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Опубліковано {} № {}".format(post_request['type_name'], post_request['code'])
    message["From"] = 'it@lxk.com.ua'
    message["To"] = mail

    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/docs/orders/{}' \
        .format(post_request['id'])

    file = File.objects.values_list('file', flat=True).filter(order_id=post_request['id']).filter(is_active=True)[0]
    download = 'Щоб завантажити документ, натисніть на посилання: http://10.10.10.22/media/{}'.format(file)

    text = 'На сайті plhk.com.ua опубліковано {} №{} "{}"{}. {}.\r\n{}' \
        .format(post_request['type_name'],
                post_request['code'],
                post_request['name'],
                responsible_text(is_it_responsible),
                link,
                download)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


@try_except
def get_deadline(recipient):
    if recipient['today']:
        return 'сьогодні спливає'
    elif recipient['tomorrow']:
        return 'завтра спливає'
    else:
        return '{} закінчився'.format(recipient['deadline'].strftime("%d.%m.%Y"))


@try_except
def create_reminder_body(recipient):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Нагадування про строки виконання наказу"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = recipient['mail']

    link = 'Щоб переглянути та відмітити виконаним, перейдіть за посиланням: http://10.10.10.22/docs/orders/{}' \
        .format(recipient['order_id'])

    file = File.objects.values_list('file', flat=True).filter(order_id=recipient['order_id']).filter(is_active=True)[0]
    download = 'Щоб завантажити документ, натисніть на посилання: http://10.10.10.22/media/{}'.format(file)

    # text = 'Нагадуємо, що {} спливає строк виконання Наказу №{} "{}".\r\n\r\n{} \r\n\r\n{}.\r\n{}' \
    #     .format(get_reminder_text(recipient),
    #             recipient['order_id'],
    #             recipient['order_name'],
    #             article_text,
    #             link,
    #             download)

    text = """\
        <html>
          <head></head>
          <body>
            <p>Нагадуємо, що {} строк виконання вами Наказу №{} "{}".</p>
            <hr/>
            <div>Текст пункту, щодо якого ви зазначені відповідальною особою:</div>
            <h3>{}</h3>
            <hr/>
            <p>{}</p>
            <p>{}</p>
          </body>
        </html>
        """\
        .format(get_deadline(recipient),
                recipient['order_id'],
                recipient['order_name'],
                recipient['article'],
                link,
                download)

    # message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(text, "html"))

    return message.as_string()


@try_except
def send_mails_default(post_request):
    author_mail = User.objects.values_list('email', flat=True).filter(id=post_request['author'])[0]
    article_ids = Order_article.objects.values_list('id', flat=True).filter(order_id=post_request['id'])

    author_body = create_mail_body(post_request, author_mail, False)
    send_email(author_mail, author_body)

    responsible_mails = Article_responsible.objects.values_list('employee_seat__employee__user__email', flat=True) \
        .filter(article_id__in=article_ids).filter(is_active=True).filter(done=False)
    for mail in responsible_mails:
        responsible_body = create_mail_body(post_request, mail, True)
        send_email(mail, responsible_body)

    supervisory_mail = User.objects.values_list('email', flat=True).filter(id=post_request['supervisory'])[0]
    supervisory_body = create_mail_body(post_request, supervisory_mail, False)
    send_email(supervisory_mail, supervisory_body)


@try_except
def send_mails_everyone(post_request):
    mail = 'all_users@lxk.com.ua'
    body = create_mail_body(post_request, mail)

    send_email(mail, body)


@try_except
def send_mails_list(post_request):
    receivers = json.loads(post_request['mail_list'])
    for receiver in receivers:
        mail = User.objects.values_list('email', flat=True).filter(id=receiver['id'])[0]
        body = create_mail_body(post_request, mail, False)
        send_email(mail, body)


def arrange_mail(post_request):
    if not testing:
        if post_request['mail_mode'] == 'to_default':
            send_mails_default(post_request)
        elif post_request['mail_mode'] == 'everyone':
            send_mails_everyone(post_request)
        elif post_request['mail_mode'] == 'list':
            send_mails_list(post_request)
            send_mails_default(post_request)


@try_except
def send_reminders():
    if not testing:
        today = datetime.date.today()
        tomorrow = today + datetime.timedelta(days=1)

        calendar = Article_responsible.objects \
            .filter(article__deadline__lte=tomorrow) \
            .filter(done=False) \
            .filter(is_active=True) \
            .filter(article__is_active=True) \
            .filter(article__order__is_act=True)

        recipients = [{
            'mail': item.employee_seat.employee.user.email,
            'order_id': item.article.order_id,
            'order_name': item.article.order.name,
            'article': item.article.text,
            'deadline': item.article.deadline,
            'today': item.article.deadline == today,
            'tomorrow': item.article.deadline == tomorrow
        } for item in calendar]

        for recipient in recipients:
            body = create_reminder_body(recipient)
            send_email(recipient['mail'], body)
