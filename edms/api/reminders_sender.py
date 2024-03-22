import datetime
from django.conf import settings
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from plxk.api.try_except import try_except
from plxk.api.mail_sender import send_email
from edms.models import Doc_Approval, Document
from edms.api.getters import get_main_field
testing = settings.STAS_DEBUG


@try_except
def send_contract_sign_reminders():
    today = datetime.date.today()
    five_days_ago = today - datetime.timedelta(days=5)
    january_first_2024 = datetime.datetime.strptime('01.01.2024', "%d.%m.%Y").date()

    not_signed_docs = [item.id for item in Document.objects
        .filter(document_type__meta_doc_type_id=5)
        .filter(is_active=True)
        .filter(closed=False)
        .filter(is_template=False)
        .filter(approved__isnull=True)
        .filter(date__range=(january_first_2024, five_days_ago))]

    for doc in not_signed_docs:
        recipients = [{
            'name': item.emp_seat.employee.pip,
            'mail': item.emp_seat.employee.user.email,
            'doc_id': item.document_id,
            'main_field': get_main_field(item.document)
        } for item in Doc_Approval.objects
            .filter(document_id=doc)
            .filter(approved__isnull=True)
            .filter(is_active=True)]

        for recipient in recipients:
            body = create_reminder_body(recipient)
            send_email(recipient['mail'], body)


@try_except
def create_reminder_body(recipient):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Нагадування про візування Договору"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = recipient['mail']

    link = 'Щоб переглянути документ, перейдіть за посиланням: http://10.10.10.22/edms/my_docs/{}' \
        .format(recipient['doc_id'])

    text = """\
        <html>
          <head></head>
          <body>
            <p>Нагадуємо про необхідність перегляду Договору №{} "{}".</p>
            <hr/>
            <p>{}</p>
          </body>
        </html>
        """\
        .format(recipient['doc_id'],
                recipient['main_field'],
                link)

    message.attach(MIMEText(text, "html"))

    return message.as_string()
