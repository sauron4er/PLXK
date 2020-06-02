import json
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404

from templates.components.try_except import try_except
from ..models import File, Document_Path
from ..forms import NewTextForm, NewRecipientForm, NewAcquaintForm, NewDayForm, NewGateForm, CarryOutItemsForm, \
    FileNewPathForm, NewMockupTypeForm, NewMockupProductTypeForm, NewClientForm
from .vacations import vacation_check


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
def post_day(doc_request, day):
    doc_request.update({'day': day})
    day_form = NewDayForm(doc_request)
    if day_form.is_valid():
        day_form.save()
    else:
        raise ValidationError('post_modules/post_day/day_form invalid')


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
            doc_path = get_object_or_404(Document_Path, pk=new_path.pk)
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