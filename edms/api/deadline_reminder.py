from django.contrib.auth.models import User
import datetime
import json
from django.conf import settings
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from plxk.api.try_except import try_except
from plxk.api.mail_sender import send_email
from docs.models import File, Article_responsible, Order_article
from edms.models import Doc_Deadline, Doc_Approval, Mark_Demand
from django.db.models import FilteredRelation, Q
from edms.api.getters import get_my_seats, get_main_field, get_document_deadline
from plxk.api.datetime_normalizers import date_to_json
testing = settings.STAS_DEBUG


@try_except
def send_deadline_reminders():
    today = datetime.date.today()
    tomorrow = today + datetime.timedelta(days=1)

    active_docs_with_deadline_ids = [item.document.id for item in
                                     Doc_Deadline.objects
                                     .filter(document__is_active=True)
                                     .filter(document__closed=False)
                                     .filter(document__approved__isnull=True)
                                     .filter(deadline__lte=tomorrow)]

    active_mark_demands = Mark_Demand.objects\
        .filter(document__id__in=active_docs_with_deadline_ids)\
        .filter(is_active=True)\
        .filter(mark__in=[2, 5, 6, 9, 11, 14, 17])  # Рахуються тільки mark Віза, Погоджено, Виконано тощо

    active_md_recipients_list = [item.recipient.employee.id for item in active_mark_demands]

    active_md_recipients_list_cleared = [*set(active_md_recipients_list)]

    for employee in active_md_recipients_list_cleared:
        # Вивести весь цей блок в окрему функцію arrange_employee(employee, active_mark_demands)
        emp_seats = get_my_seats(employee)
        emps_seats_ids = [emp_seat['id'] for emp_seat in emp_seats]
        active_docs_with_deadline_for_employee = [{
                'doc_id': item.document_id,
                'doc_type': item.document.document_type.description,

                # Тут треба знайти активний deadline, мабуть, за допомогою окремої функції
                'deadline': get_document_deadline(item.document),


                'author': item.document.employee_seat.employee.pip,
                'main_field': get_main_field(item.document),
                # 'deadline_status': 'overdue' if item.document.deadline.deadline <= today
                #     else 'tomorrow' if item.document.deadline.deadline == tomorrow else 'today'
            } for item in active_mark_demands.filter(recipient_id__in=emps_seats_ids)]

        pass


        # active_deadlines_for_all_seats = []
        # for emp_seat in emp_seats:
        #     active_docs_with_deadline_for_this_emp_seat = [{
        #         'doc_id': item.document_id,
        #         'doc_type': item.document.document_type.description,
        #         'deadline': item.document.deadline
        #     } for item in active_mark_demands.filter(recipient_id=emp_seat['id'])]
        #     active_deadlines_for_all_seats.append(active_docs_with_deadline_for_this_emp_seat)

        active_docs_with_deadline = 1 # mark demand by recipient id --> doc --> deadline is < tomorrow


    # active_docs_with_deadline_list = [{
    #     'id': item.document.id,
    #     'deadline': item.deadline
    # } for item in active_docs_with_deadline]

    # docs_tomorrow = [{
    #     'id': item.document.id,
    #     'deadline': item.deadline
    # } for item in active_docs_with_deadline.filter(deadline=tomorrow)]
    #
    # docs_today = [{
    #     'id': item.document.id,
    #     'deadline': item.deadline
    # } for item in active_docs_with_deadline.filter(deadline=today)]
    #
    # docs_overdue = [{
    #     'id': item.document.id,
    #     'deadline': item.deadline
    # } for item in active_docs_with_deadline.filter(deadline__lt=today)]

    # Посортувати по отримувачу і відсилати кожному отримувачу один лист з усіма дедлайнами.
    # Те саме зробити по наказах

    a=1


