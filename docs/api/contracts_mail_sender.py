from plxk.api.mail_sender import send_email
from django.conf import settings
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

testing = settings.STAS_DEBUG


def create_mail_body(post_request):
    message = MIMEMultipart("alternative")
    message["Subject"] = "На сайт plhk.com.ua додано новий Договір"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = "law@lxk.com.ua"

    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/docs/contracts/{}' \
        .format(post_request['contract'])
    text = 'На сайті ПЛХК опубліковано новий Договір. {}.'.format(link)

    message.attach(MIMEText(text, "plain"))

    return message.as_string()


def send_mail(post_request):
    if not testing:
        body = create_mail_body(post_request)
        send_email("law@lxk.com.ua", body)
