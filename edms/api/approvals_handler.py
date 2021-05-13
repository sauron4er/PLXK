from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from datetime import datetime
from plxk.api.try_except import try_except
from ..models import Document_Type_Module, Doc_Approval, Doc_Type_Phase
from ..forms import ApproveForm, DeactivateApproveForm, ApprovedDocForm, Document, NewApprovalForm, ApprovedApprovalForm
from .getters import get_main_employee, get_phase_recipient_list


@try_except
# Функція, яка повертає Boolean чи використовує документ фазу auto_approved
def is_auto_approved_phase_used(doc_type):
    return Doc_Type_Phase.objects.values('id') \
        .filter(document_type_id=doc_type) \
        .filter(mark_id=20) \
        .exists()


# Функція, яка повертає Boolean чи використовує документ систему візування
# (з допомогою модулю approvals або автоматичну)
def is_approvals_used(doc_type):
    return Doc_Type_Phase.objects.values('id')\
        .filter(document_type_id=doc_type) \
        .filter(mark_id=17) \
        .exists()


# Функція, яка повертає Boolean чи використовує документ модуль approvals
def is_approval_module_used(doc_type):
    return Document_Type_Module.objects.values('id') \
        .filter(document_type_id=doc_type) \
        .filter(module_id=22) \
        .exists()


@try_except
# Опрацьовує автоматичний список візуючих при створенні документа
def add_zero_phase_auto_approvals(doc_request, phase_info):
    recipients = get_phase_recipient_list(phase_info['id'], doc_request['doc_version'])

    for recipient in recipients:
        if not is_in_approval_list(recipient, doc_request['document']):
            doc_request.update({'emp_seat': recipient})
            doc_request.update({'approve_queue': phase_info['phase']})
            doc_request.update({'approved': None})
            doc_request.update({'approve_path': None})
            approval_form = NewApprovalForm(doc_request)
            if approval_form.is_valid():
                approval_form.save()
                # post_mark_demand(doc_request, recipient, phase_info['id'], phase_info['mark_id'])
                # new_mail('new', [{'id': recipient}], doc_request)
            else:
                raise ValidationError('edms/api/approvals_handler post_approval_list approval_form invalid')


@try_except
def post_approve(doc_request, approve_id, is_approved):
    approve = get_object_or_404(Doc_Approval, pk=approve_id)
    doc_request.update({'approved': is_approved})
    if is_approved is None:
        approve_form = DeactivateApproveForm(doc_request, instance=approve)
    else:
        doc_request.update({'approve_path': doc_request['document_path']})
        approve_form = ApproveForm(doc_request, instance=approve)
    if approve_form.is_valid:
        approve_form.save()
    else:
        raise ValidationError('edms/views post_approve approve_form invalid')


@try_except
def post_auto_approve(doc_request):
    doc_request.update({'approved_date': datetime.now()})

    doc = get_object_or_404(Document, pk=doc_request['document'])

    approved_doc_form = ApprovedDocForm(doc_request, instance=doc)
    if approved_doc_form.is_valid():
        approved_doc_form.save()
    else:
        raise ValidationError('phases_handler/post_auto_approve/approved_doc_item_form invalid')


def is_doc_completely_approved(doc_request):
    approvals = list(Doc_Approval.objects.values_list('approved', flat=True)
            .filter(document_id=doc_request['document'])
            .filter(is_active=True))

    return False not in approvals and None not in approvals


def arrange_approve(doc_request, is_approved):
    recipient = doc_request['employee_seat']
    approve_id = Doc_Approval.objects.values_list('id', flat=True) \
        .filter(document_id=doc_request['document']) \
        .filter(emp_seat_id=recipient)

    if approve_id:
        post_approve(doc_request, approve_id[0], is_approved)
    else:
        # Якщо для цього працівника нема approval, то approval є для того, замість кого цей в.о.
        main_employee = get_main_employee(recipient)
        approve_id = Doc_Approval.objects.values_list('id', flat=True) \
            .filter(document_id=doc_request['document']) \
            .filter(emp_seat_id=main_employee)
        post_approve(doc_request, approve_id[0], is_approved)


# Визначає, чи внесений вже користувач у таблицю погоджень
@try_except
def is_in_approval_list(emp_seat_id, document):
    is_in_approval_list = Doc_Approval.objects\
        .filter(document_id=document)\
        .filter(emp_seat_id=emp_seat_id)\
        .filter(is_active=True)\
        .exists()
    return is_in_approval_list
