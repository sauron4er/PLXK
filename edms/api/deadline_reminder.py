from django.contrib.auth.models import User
import datetime
import json
from django.conf import settings
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from plxk.api.try_except import try_except
from plxk.api.mail_sender import send_email
from docs.models import File, Article_responsible, Order_article
from edms.models import Doc_Deadline, Doc_Approval
from django.db.models import FilteredRelation, Q

testing = settings.STAS_DEBUG


@try_except
def send_deadline_reminders():
    today = datetime.date.today()
    tomorrow = today + datetime.timedelta(days=1)
    in_a_week = today + datetime.timedelta(days=7)

    active_docs_with_deadline = Doc_Deadline.objects\
        .filter(document__is_active=True)\
        .filter(document__closed=False)\
        .filter(document__approved__isnull=True)

    active_docs_with_deadline_list = [{
        'id': item.document.id,
        'deadline': item.deadline
    } for item in active_docs_with_deadline]

    docs_less_than_week = active_docs_with_deadline.filter(deadline__lte=in_a_week).filter(deadline__gt=tomorrow)

    docs_less_than_week_list = [{
        'id': item.document.id,
        'deadline': item.deadline
    } for item in active_docs_with_deadline.filter(deadline__lte=in_a_week).filter(deadline__gt=tomorrow)]

    for doc in docs_less_than_week_list:
        approvals = 1

    docs_tomorrow = [{
        'id': item.document.id,
        'deadline': item.deadline
    } for item in active_docs_with_deadline.filter(deadline=tomorrow)]

    docs_today = [{
        'id': item.document.id,
        'deadline': item.deadline
    } for item in active_docs_with_deadline.filter(deadline=today)]

    docs_overdue = [{
        'id': item.document.id,
        'deadline': item.deadline
    } for item in active_docs_with_deadline.filter(deadline__lt=today)]

    # Посортувати по отримувачу і відсилати кожному отримувачу один лист з усіма дедлайнами.
    # Те саме зробити по наказах

    a=1
