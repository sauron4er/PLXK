from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from plxk.api.try_except import try_except
from ..models import Document_Type_Module, Doc_Approval, Doc_Type_Phase, Document_Path
from ..forms import ApproveForm, DeactivateApproveForm
from .getters import get_main_employee


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


def is_doc_completely_approved(doc_request):
    approvals = list(Doc_Approval.objects.values_list('approved', flat=True)
            .filter(document_id=doc_request['document'])
            .filter(is_active=True))

    return False not in approvals


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
