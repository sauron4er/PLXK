from datetime import datetime
from docs.api.orders_mail_sender import send_reminders as send_reminders_about_orders


def do_stuff():
    now = datetime.now()
    current_hour = now.strftime("%H")
    print(current_hour == '06')


def arrange_reminders():
    now = datetime.now()
    current_hour = now.strftime("%H")
    if current_hour == '06':
        send_reminders_about_orders()
