from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404

from plxk.api.try_except import try_except
from edms.api.edms_mail_sender import send_email_new, send_email_mark, send_email_answer
from edms.api.getters import get_main_field
from edms.models import Employee_Seat, Mark_Demand, Document, Doc_Text, Doc_Foyer_Range, Doc_Employee, Foyer, Doc_Approval
from edms.forms import MarkDemandForm, DeleteDocForm, DeactivateDocForm, DeactivateMarkDemandForm, MarkDemandChangeRecipientForm
from edms.api.vacations import vacation_check

from django.conf import settings

testing = settings.STAS_DEBUG


@try_except
def set_stage(doc_id, stage):
    doc = get_object_or_404(Document, pk=doc_id)
    doc.stage = stage
    doc.save()


@try_except
def post_mark_demand(doc_request, emp_seat_id, phase_id, mark):
    request = doc_request.copy()
    emp_seat_id = vacation_check(emp_seat_id)

    # Якщо на ознайомлення, то не відправляємо, якщо є будь-який інший mark_demand,
    # в іншому разі не відправляємо, якщо є такий самий mark_demand
    already_exists = Mark_Demand.objects \
        .filter(document_id=doc_request['document']) \
        .filter(recipient_id=emp_seat_id) \
        .filter(is_active=True)

    if mark != 8:
        already_exists = already_exists.filter(mark_id=mark)

    if not already_exists.exists():
        if not doc_request['comment']:
            request.update({'comment': None})
        request.update({'recipient': emp_seat_id})
        request.update({'phase': phase_id})
        request.update({'mark': mark})

        mark_demand_form = MarkDemandForm(request)
        if mark_demand_form.is_valid:
            mark_demand_form.save()
        else:
            raise ValidationError('edms/api/setters post_mark_demand mark_demand_form invalid')


@try_except
def delete_doc(doc_request, doc_id):
    try:
        doc = get_object_or_404(Document, pk=doc_id)
        doc_request.update({'closed': True})
        delete_doc_form = DeleteDocForm(doc_request, instance=doc)
        if delete_doc_form.is_valid():
            delete_doc_form.save()
        else:
            raise ValidationError('edms/view/delete_doc: delete_doc_form invalid')
    except ValidationError as err:
        raise err
    except Exception as err:
        raise err


@try_except
def deactivate_doc(doc_request, doc_id):
    try:
        doc = get_object_or_404(Document, pk=doc_id)
        doc_request.update({'is_active': False})
        deactivate_doc_form = DeactivateDocForm(doc_request, instance=doc)
        if deactivate_doc_form.is_valid():
            deactivate_doc_form.save()
        else:
            raise ValidationError('edms/view func deactivate_doc: deactivate_doc_form invalid')
    except ValidationError as err:
        raise err
    except Exception as err:
        raise err


@try_except
def deactivate_mark_demand(doc_request, md_id):
    md = get_object_or_404(Mark_Demand, pk=md_id)
    doc_request.update({'is_active': False})

    deactivate_mark_demand_form = DeactivateMarkDemandForm(doc_request, instance=md)
    if deactivate_mark_demand_form.is_valid:
        deactivate_mark_demand_form.save()
    else:
        raise ValidationError('edms/views deactivate_mark_demand deactivate_mark_demand_form invalid')


# Деактивація всіх MarkDemand документа:
@try_except
def deactivate_doc_mark_demands(doc_request, doc_id):
    mark_demands = [{
        'id': md.id,
    } for md in Mark_Demand.objects.filter(document_id=doc_id).filter(is_active=True)]

    for md in mark_demands:
        deactivate_mark_demand(doc_request, md['id'])


@try_except
def set_doc_text_module(request):
    doc_text_module = Doc_Text.objects \
        .filter(document_id=request.POST['document_id']) \
        .filter(queue_in_doc=request.POST['text_queue']) \
        .filter(is_active=True).order_by('-id')
    if doc_text_module:
        edit_text = get_object_or_404(Doc_Text, pk=doc_text_module[0].id)
        edit_text.text = request.POST['text']
        edit_text.save()
    else:
        new_text = Doc_Text(
            document_id=request.POST['document_id'],
            text=request.POST['text'],
            queue_in_doc=request.POST['text_queue'])
        new_text.save()


# Обробка різних видів позначок: ---------------------------------------------------------------------------------------
@try_except
def post_mark_delete(doc_request):
    delete_doc(doc_request, int(doc_request['document']))
    deactivate_doc_mark_demands(doc_request, int(doc_request['document']))


@try_except
def post_mark_deactivate(doc_request):
    deactivate_doc(doc_request, int(doc_request['document']))

    # Деактивуємо всі mаrk_demands крім на ознайомлення:
    mark_demands = [{
        'id': md.id,
    } for md in
        Mark_Demand.objects.filter(document_id=doc_request['document']).filter(is_active=True).exclude(mark_id=8)]

    for md in mark_demands:
        deactivate_mark_demand(doc_request, md['id'])


@try_except
def save_foyer_ranges(doc_id):
    foyer_ranges = Doc_Foyer_Range.objects\
        .filter(document_id=doc_id)\
        .filter(is_active=True)
    employee = Doc_Employee.objects.values_list('employee_id', flat=True)\
        .filter(document_id=doc_id)\
        .filter(is_active=True)[0]
    doc_version = Document.objects.values_list('doc_type_version__version_id', flat=True).filter(id=doc_id)[0]

    for range in foyer_ranges:
        new_foyer = Foyer(
            edms_doc_id=doc_id,
            employee_id=employee,
            out_datetime=range.out_datetime,
            in_datetime=range.in_datetime,
            absence_based=doc_version == 1  # 1 - Звільнююча, 2 - тимчасова/забув
        )
        new_foyer.save()


# Функція, яка відправляє листи:
@try_except
def new_mail(email_type, recipients, doc_request):
    if not testing:
        document_instance = get_object_or_404(Document, pk=doc_request['document'])
        main_field = get_main_field(document_instance)

        for recipient in recipients:
            mail = Employee_Seat.objects.values_list('employee__user__email', flat=True).filter(id=recipient['id'])[0]
            if mail:
                if email_type == 'new':
                    send_email_new(doc_request, mail, main_field)
                elif email_type == 'mark':
                    send_email_mark(doc_request, mail, main_field)
                elif email_type == 'answer':
                    send_email_answer(doc_request, mail)