from datetime import datetime
from docs.api.orders_mail_sender import send_reminders as send_reminders_about_orders
from accounts.api.vacations import arrange_vacations_api as arrange_vacations


def do_automatic_stuff():
    now = datetime.now()
    current_hour = now.strftime("%H")
    if current_hour == '06':
        send_reminders_about_orders()
        # send_reminders_about_documents()
        # send_reminders_about_permissions()
        arrange_vacations()
