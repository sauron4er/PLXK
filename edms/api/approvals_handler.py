from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from plxk.api.try_except import try_except
from ..models import Document_Type_Module, Doc_Approval
from ..forms import ApproveForm, DeactivateApproveForm
from ..models import Doc_Type_Phase


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
