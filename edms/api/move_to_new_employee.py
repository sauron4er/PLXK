from django.shortcuts import get_object_or_404

from plxk.api.try_except import try_except
from edms.models import Mark_Demand, Doc_Approval, Document, Employee_Seat
from edms.forms import MarkDemandChangeRecipientForm
from docs.models import Article_responsible, Order_doc

from django.conf import settings

testing = settings.STAS_DEBUG


@try_except
def move_docs(move_from, move_to):
    active_created_docs = Document.objects.values_list('id', flat=True) \
        .filter(employee_seat_id=move_from) \
        .filter(closed=False) \
        .filter(is_active=True)
    for doc in active_created_docs:
        doc_instance = get_object_or_404(Document, pk=doc)
        doc_instance.employee_seat_id = move_to
        doc_instance.save()

    mark_demands = Mark_Demand.objects.values_list('id', flat=True).filter(recipient_id=move_from).filter(is_active=True)
    for mark_demand in mark_demands:
        mark_demand_instance = get_object_or_404(Mark_Demand, pk=mark_demand)
        form_data = {'recipient': move_to}
        form = MarkDemandChangeRecipientForm(form_data, instance=mark_demand_instance)
        if form.is_valid:
            form.save()


@try_except
def move_approvals(move_from, move_to):
    approvals = Doc_Approval.objects.values_list('id', flat=True)\
        .filter(emp_seat_id=move_from)\
        .filter(is_active=True)\
        .filter(approved__is_null=True)
        # .exclude(approved=True)\
    for approval in approvals:
        approval_instance = get_object_or_404(Doc_Approval, pk=approval)
        approval_instance.emp_seat_id = move_to
        approval_instance.save()


@try_except
def move_orders(employee_seat_from, employee_seat_to):
    # Переносимо відповідальність за пункти в наказах
    orders_responsible = Article_responsible.objects\
        .filter(employee_seat_id=employee_seat_from)\
        .filter(done=False)\
        .filter(is_active=True)
    for order in orders_responsible:
        order_instance = get_object_or_404(Article_responsible, pk=order.id)
        order_instance.employee_seat_id = employee_seat_to
        order_instance.save()

    # Переносимо "Контроль за виконанням"
    user_from = Employee_Seat.objects.values_list('employee__user_id', flat=True).filter(id=employee_seat_from)[0]
    user_to = Employee_Seat.objects.values_list('employee__user_id', flat=True).filter(id=employee_seat_to)[0]
    orders_supervisory = Order_doc.objects\
        .filter(supervisory_id=user_from)\
        .filter(done=False)\
        .filter(is_act=True)
    for order in orders_supervisory:
        order_instance = get_object_or_404(Order_doc, pk=order.id)
        order_instance.supervisory_id = user_to
        order_instance.save()
