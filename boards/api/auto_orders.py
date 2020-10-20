from docs.api.orders_mail_sender import send_reminders


def send_orders_reminders():
    send_reminders()
    print('orders reminders sent')
