from docs.api.orders_mail_sender import send_reminders
from django import db
from edms.models import Document


def send_orders_reminders():
    # db.close_old_connections()
    # db.connections.close_all()
    # doc1 = Document.objects.values_list('id', flat=True).filter(id=1)
    # print('doc1:' + doc1[0])

    send_reminders()
    print('orders reminders sent')
