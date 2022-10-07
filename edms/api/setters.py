import json

from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404

from plxk.api.try_except import try_except
from edms.api.edms_mail_sender import send_email_new, send_email_mark, send_email_answer,\
    send_email_deleted_from_approvals, send_email_remind
from edms.models import Employee_Seat, Mark_Demand, Document, Doc_Text, Doc_Foyer_Range, Doc_Employee, Foyer, Doc_Approval, \
    Document_Type, Doc_Type_Phase, Document_Path, Contract_Subject_Approval, Contract_Subject_To_Work, Document_Type_Version
from edms.forms import MarkDemandForm, DeleteDocForm, DeactivateDocForm, DeactivateMarkDemandForm
from edms.api.vacations import vacation_check
from edms.api.getters import get_doc_version_from_description_matching

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


@try_except
def deactivate_doc_mark_demands(doc_request, doc_id, mark_id=None):
    mark_demands = Mark_Demand.objects.values_list('id', flat=True)\
        .filter(document_id=doc_id)\
        .filter(is_active=True)
    if mark_id:
        mark_demands = mark_demands.filter(mark_id=mark_id)

    for md in mark_demands:
        deactivate_mark_demand(doc_request, md)


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


@try_except
def post_mark_delete(doc_request):
    delete_doc(doc_request, int(doc_request['document']))
    deactivate_doc_mark_demands(doc_request, int(doc_request['document']))


@try_except
def post_mark_deactivate(doc_request):
    deactivate_doc(doc_request, int(doc_request['document']))

    mark_demands = [{
        'id': md.id,
    } for md in
        Mark_Demand.objects.filter(document_id=doc_request['document']).filter(is_active=True)]
        # Mark_Demand.objects.filter(document_id=doc_request['document']).filter(is_active=True).exclude(mark_id=8)]

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
            absence_based=doc_version == 1  # 1 - з виходу до входу працівника, 2 - навпаки
        )
        new_foyer.save()


@try_except
def post_new_doc_approvals(request):
    try:
        doc_id = request.POST['doc_id']
        resp_emp_seat_id = request.POST['resp_seat_id']
        new_approvals = json.loads(request.POST['approvals'])

        # Видаляємо тих, хто вже є у візуванні:
        cleared_approvals = []
        for new_approval in new_approvals:
            already_exists = Doc_Approval.objects\
                .filter(document_id=doc_id)\
                .filter(emp_seat_id=new_approval['emp_seat_id'])\
                .filter(is_active=True)\
                .exists()
            if not already_exists:
                cleared_approvals.append(new_approval)

        if cleared_approvals:
            # Створюємо позначку (для запису у mark_demands)
            new_path = Document_Path(document_id=doc_id, employee_seat_id=resp_emp_seat_id, mark_id=29)
            new_path.save()

            # Додаємо візуючих у таблицю і додаємо їм mark_demand
            doc_type = get_object_or_404(Document_Type, meta_doc_type=5, is_active=True)
            approval_phase = get_object_or_404(Doc_Type_Phase, document_type=doc_type, mark_id=17)
            for approval in cleared_approvals:
                approval_instance = Doc_Approval(document_id=doc_id,
                                                 emp_seat_id=approval['emp_seat_id'],
                                                 approve_queue=1)
                approval_instance.save()

                approval['id'] = approval_instance.id

                # Додаємо mark_demand
                post_mark_demand({'document': doc_id, 'comment': None, 'document_path': new_path.id},
                                 approval_instance.emp_seat_id,
                                 approval_phase.id, 17)

            # Надсилаємо листи після того, як обробили весь список
            responsible = get_object_or_404(Employee_Seat, id=resp_emp_seat_id)
            info_for_mail = {'doc_type_name': doc_type.description,
                             'document': doc_id,
                             'doc_author_name': responsible.employee.pip}
            for approval in cleared_approvals:
                new_mail('new', [{'id': approval['emp_seat_id']}], info_for_mail)

        return json.dumps(cleared_approvals)
    except():
        return 'error'


@try_except
def new_mail(email_type, recipients, doc_request):
    if not testing:
        document_instance = get_object_or_404(Document, pk=doc_request['document'])
        main_field = document_instance.main_field

        for recipient in recipients:
            # mail = 'sauron4er@gmail.com'
            mail = Employee_Seat.objects.values_list('employee__user__email', flat=True).filter(id=recipient['id'])[0]
            if mail:
                if email_type == 'new':
                    send_email_new(doc_request, mail, main_field)
                elif email_type == 'mark':
                    send_email_mark(doc_request, mail, main_field)
                elif email_type == 'answer':
                    send_email_answer(doc_request, mail)
                elif email_type == 'deleted_from_approvals':
                    send_email_deleted_from_approvals(doc_request, mail, main_field)
                elif email_type == 'remind':
                    send_email_remind(doc_request, mail, main_field)


@try_except
def edit_contract_subject_approval(contract_subject_id, approval):
    if approval['status'] == 'new':
        cs = Contract_Subject_Approval(subject_id=contract_subject_id, recipient_id=approval['id'])
        cs.save()
    elif approval['status'] == 'del':
        cs = Contract_Subject_Approval.objects.get(id=approval['approval_id'])
        cs.is_active = False
        cs.save()


@try_except
def edit_contract_subject_to_work(contract_subject_id, to_work):
    if to_work['status'] == 'new':
        cs = Contract_Subject_To_Work(subject_id=contract_subject_id, recipient_id=to_work['id'])
        cs.save()
    elif to_work['status'] == 'del':
        cs = Contract_Subject_To_Work.objects.get(id=to_work['to_work_id'])
        cs.is_active = False
        cs.save()


@try_except
def handle_doc_type_version(new_doc, doc_request, doc_modules):
    if 'cost_rates' in doc_modules:
        doc_type_version_id = get_doc_version_from_description_matching(
            doc_request['document_type'], doc_modules['cost_rates']['department'])
        new_doc.doc_type_version_id = doc_type_version_id
        return new_doc

    elif doc_request['document_type'] == '20':
        doc_type_version = Document_Type_Version.objects.get(document_type_id=20, version_id=doc_request['doc_type_version'])
        new_doc.doc_type_version_id = doc_type_version.id
        return new_doc

    elif doc_request['doc_type_version'] != '0' and doc_request['doc_type_version'] != 'undefined':
        new_doc.doc_type_version_id = doc_request['doc_type_version']
        return new_doc

    return new_doc
