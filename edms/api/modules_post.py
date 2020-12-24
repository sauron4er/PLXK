import json
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from plxk.api.try_except import try_except
from ..models import File, Document_Path
from ..forms import NewTextForm, NewRecipientForm, NewAcquaintForm, NewDayForm, NewGateForm, CarryOutItemsForm, \
    FileNewPathForm, NewMockupTypeForm, NewMockupProductTypeForm, NewClientForm, NewDocContractForm, Employee_Seat
from .vacations import vacation_check
from edms.api.getters import get_zero_phase_id, get_dep_chief_id, get_chief_id
from edms.api.setters import post_mark_demand, new_mail
from edms.api.phases_handler import post_approval_list


@try_except
def post_text(doc_request, text_list):
    for text in text_list:
        doc_request.update({'queue_in_doc': text['queue']})
        doc_request.update({'text': text['text']})
        text_form = NewTextForm(doc_request)
        if text_form.is_valid():
            text_form.save()
        else:
            raise ValidationError('post_modules/post_text/text_form invalid')


@try_except
def post_recipient_chief(doc_request, recipient_chief):
    # Отримувач-шеф отримує mark-demand з вимогою поставити "Погоджую"
    chief_emp_seat_id = vacation_check(recipient_chief)
    doc_request.update({'recipient': chief_emp_seat_id})

    recipient_form = NewRecipientForm(doc_request)
    if recipient_form.is_valid():
        recipient_form.save()
    else:
        raise ValidationError('post_modules/post_recipient_chief/recipient_form invalid')


@try_except
def post_acquaint_list(doc_request, acquaint_list):  # отримуючі на ознайомлення
    for recipient in acquaint_list:
        emp_seat_id = vacation_check(recipient['id'])
        doc_request.update({'acquaint_emp_seat': emp_seat_id})

        acquaint_form = NewAcquaintForm(doc_request)
        if acquaint_form.is_valid():
            acquaint_form.save()
        else:
            raise ValidationError('post_modules/post_acquaint_list/acquaint_form invalid')


@try_except
def post_days(doc_request, days):
    for day in days:
        doc_request.update({'queue_in_doc': day['queue']})
        doc_request.update({'day': day['day']})
        day_form = NewDayForm(doc_request)
        day_form.save()


@try_except
def post_approvals(doc_request, approvals, company):
    # TODO Не додавати нікого, якщо це шаблон чи чернетка
    # Додаємо у список погоджуючих автора, керівника відділу та директора

    # Видаляємо автора зі списку і додаємо, щоб він там був лише раз:
    approvals[:] = [i for i in approvals if not (int(i['id']) == int(doc_request['employee_seat']))]

    approvals.append({
        'id': doc_request['employee_seat'],
        'approve_queue': 0  # Автор документа перший у списку погоджень
    })

    # Видаляємо директора зі списку і додаємо, щоб він там був лише раз:
    director = Employee_Seat.objects.values_list('id', flat=True) \
        .filter(seat_id=16) \
        .filter(is_active=True) \
        .filter(is_main=True)[0]

    acting_director = vacation_check(director)

    if company == 'ТДВ':
        approvals[:] = [i for i in approvals if not (int(i['id']) == director or int(i['id']) == acting_director)]

        approvals.extend([{
            'id': acting_director,
            'approve_queue': 3  # Директор останній у списку погоджень
        }])
    else:
        zero_phase_id = get_zero_phase_id(doc_request['document_type'])
        post_mark_demand(doc_request, acting_director, zero_phase_id, 8)
        new_mail('new', [{'id': acting_director}], doc_request)

        tov_director = Employee_Seat.objects.values_list('id', flat=True) \
            .filter(seat_id=247) \
            .filter(is_active=True) \
            .filter(is_main=True)[0]

        acting_tov_director = vacation_check(tov_director)

        approvals[:] = [i for i in approvals if not (int(i['id']) == tov_director or int(i['id']) == acting_tov_director)]

        approvals.extend([{
            'id': acting_tov_director,
            'approve_queue': 3  # Директор останній у списку погоджень
        }])

    # Видаляємо керівника відділу зі списку і додаємо, щоб він там був лише раз (якщо це не директор):
    chief = get_dep_chief_id(doc_request['employee_seat'])
    # якщо у відділа нема керівника, призначаємо безпос. керівника автора:
    if chief is None:
        chief = get_chief_id(doc_request['employee_seat'])

    if chief is None:
        raise ObjectDoesNotExist('У автора нема безпосереднього начальника')
    elif chief != int(doc_request['employee_seat']) and chief != director:
        approvals[:] = [i for i in approvals if not (int(i['id']) == chief)]

        approvals.append({
            'id': chief,
            'approve_queue': 1  # Керівник відділу другий у списку погоджень
        })

    post_approval_list(doc_request, approvals)


@try_except
def post_gate(doc_request, gate):
    doc_request.update({'gate': gate})
    gate_form = NewGateForm(doc_request)
    if gate_form.is_valid():
        gate_form.save()
    else:
        raise ValidationError('post_modules/post_day/day_form invalid')


@try_except
def post_carry_out_items(doc_request, carry_out_items):
    for item in carry_out_items:
        doc_request.update({'item_name': item['item_name']})
        doc_request.update({'quantity': item['quantity']})
        doc_request.update({'measurement': item['measurement']})
        carry_out_item_form = CarryOutItemsForm(doc_request)
        if carry_out_item_form.is_valid():
            carry_out_item_form.save()
        else:
            raise ValidationError('post_modules/post_carry_out_item/carry_out_item_form invalid')


@try_except
def post_files(doc_request, files, new_path):
    # Додаємо файли зі старого варіанта файла:
    if 'old_files' in doc_request.keys():
        old_files = json.loads(doc_request['old_files'])
        if old_files:
            for old_file in old_files:
                file = get_object_or_404(File, pk=old_file['id'])
                file_change_path_form = FileNewPathForm(doc_request, instance=file)
                if file_change_path_form.is_valid():
                    file_change_path_form.save()
                else:
                    raise ValidationError('post_modules/post_files/file_change_path_form invalid')

    # Додаємо нові файли:
    if files:
        # Поки що файли додаються тільки якщо документ публікується не як чернетка, тому що
        # для публікації файла необідно мати перший path_id документа, якого нема в чернетці
        if new_path is not None:
            doc_path = get_object_or_404(Document_Path, pk=new_path)
            # Якщо у doc_request нема "Mark" - це створення нового документу, потрібно внести True у first_path:
            first_path = doc_request['mark'] == 1

            for file in files:
                File.objects.create(
                    document_path=doc_path,
                    file=file,
                    name=file.name,
                    first_path=first_path
                )


@try_except
def post_mockup_type(doc_request, mockup_type):
    doc_request.update({'mockup_type': mockup_type})
    mockup_type_form = NewMockupTypeForm(doc_request)
    if mockup_type_form.is_valid():
        mockup_type_form.save()
    else:
        raise ValidationError('post_modules/post_mockup_type/mockup_type_form invalid')


@try_except
def post_mockup_product_type(doc_request, mockup_product_type):
    doc_request.update({'mockup_product_type': mockup_product_type})
    mockup_product_type_form = NewMockupProductTypeForm(doc_request)
    if mockup_product_type_form.is_valid():
        mockup_product_type_form.save()
    else:
        raise ValidationError('post_modules/post_mockup_product_type/mockup_product_type_form invalid')


@try_except
def post_client(doc_request, client):
    doc_request.update({'client': client})
    client_form = NewClientForm(doc_request)
    if client_form.is_valid():
        client_form.save()
    else:
        raise ValidationError('post_modules/post_client/client_form invalid')


@try_except
def post_contract(doc_request, contract_id):
    if contract_id != 0:
        doc_request.update({'contract_id': contract_id})
        contract_form = NewDocContractForm(doc_request)
        if contract_form.is_valid():
            contract_form.save()
        else:
            raise ValidationError('post_modules/post_client/client_form invalid')


@try_except
def post_company(new_doc, company):
    new_doc.company = company
    new_doc.save()
