from datetime import date
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404

from templates.components.try_except import try_except
from ..models import Doc_Type_Phase, Document
from ..models import File, Document_Path
from ..forms import ApprovedDocForm
from .vacations import vacation_check


@try_except
# Функція, яка повертає Boolean чи використовує документ фазу auto_approved
def is_auto_approved_phase_used(doc_type):
    return Doc_Type_Phase.objects.values('id') \
        .filter(document_type_id=doc_type) \
        .filter(mark_id=20) \
        .exists()


@try_except
def post_auto_approve(doc_request):
    doc_request.update({'approved_date': date.today()})

    doc = get_object_or_404(Document, pk=doc_request['document'])

    approved_doc_form = ApprovedDocForm(doc_request, instance=doc)
    if approved_doc_form.is_valid():
        approved_doc_form.save()
    else:
        raise ValidationError('phases_handler/post_auto_approve/approved_doc_item_form invalid')
