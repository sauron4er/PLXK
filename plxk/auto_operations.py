from datetime import datetime
from docs.api.orders_mail_sender import send_order_reminders
from accounts.api.vacations import arrange_vacations_api as arrange_vacations
from edms.api.reminders_sender import send_contract_sign_reminders


def do_automatic_stuff():
    now = datetime.now()
    current_hour = now.strftime("%H")
    weekday = now.isoweekday()
    if weekday < 6 and current_hour == '06':
        send_order_reminders()
        # send_contract_sign_reminders()
        # send_reminders_about_permissions()
        arrange_vacations()
