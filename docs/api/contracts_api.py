import json
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from plxk.api.try_except import try_except
from docs.models import Contract, Contract_File
from docs.forms import NewContractForm, DeactivateContractForm, DeactivateContractFileForm
from edms.models import Document, Document_Type_Module, Doc_Contract_Subject
from docs.api.contracts_mail_sender import send_mail


@try_except
def add_contract(request):
    contract = json.loads(request.POST.get('contract'))
    contract.update({'edms_doc_id': None})
    return post_contract(request.user.id, contract)


@try_except
def post_contract(author, contract):
    new_contract = Contract(created_by_id=author)

    new_contract.number = contract['number']
    new_contract.company = contract['company']

    if contract['counterparty'] != 0:
        new_contract.counterparty_link_id = contract['counterparty']
    else:
        new_contract.counterparty = contract['counterparty_text']

    new_contract.subject = contract['subject']
    new_contract.nomenclature_group = contract['nomenclature_group']
    new_contract.date_start = contract['date_start'] if contract['date_start'] != '' else None
    new_contract.date_end = contract['date_end'] if contract['date_end'] != '' else None
    new_contract.responsible_id = contract['responsible'] if contract['responsible'] != 0 else None
    new_contract.department_id = contract['department'] if contract['department'] != 0 else None
    new_contract.lawyers_received = contract['lawyers_received']
    new_contract.edms_doc_id = contract['edms_doc_id'] if contract['edms_doc_id'] != 0 else None
    new_contract.incoterms = contract['incoterms'] if contract['incoterms'] != '' else None
    new_contract.purchase_terms = contract['purchase_terms'] if contract['purchase_terms'] != '' else None
    new_contract.basic_contract_id = contract['basic_contract']

    new_contract.save()

    return new_contract.pk


@try_except
def get_texts_from_edms(edms_doc, queue):
    return edms_doc.texts.values_list('text', flat=True).filter(queue_in_doc=queue)[0] \
        if edms_doc.texts.values_list('text', flat=True).filter(queue_in_doc=queue) \
        else None


@try_except
def get_days_from_edms(edms_doc, queue):
    return edms_doc.days.values_list('day', flat=True).filter(queue_in_doc=queue)[0] \
        if edms_doc.days.values_list('day', flat=True).filter(queue_in_doc=queue) \
        else None


@try_except
def add_contract_from_edms(doc_request, files):
    edms_doc = get_object_or_404(Document, pk=doc_request['document'])
    contract_fields_queue = list(Document_Type_Module.objects.values('field', 'queue')
                                 .filter(document_type=edms_doc.document_type)
                                 .exclude(field=None))

    fields_queue = {}
    for cf in contract_fields_queue:
        fields_queue.update(
            {cf['field']: cf['queue']}
        )

    basic_contract = edms_doc.contract.values_list('contract_id', flat=True)
    basic_contract = basic_contract[0] if len(basic_contract) > 0 else None

    counterparty_id = 0
    counterparty_text = ''

    if edms_doc.counterparty.exists():
        counterparty_id = edms_doc.counterparty.get().counterparty_id or 0
        if counterparty_id == 0:
            counterparty_text = edms_doc.counterparty.get().counterparty_input
    else:
        counterparty_text = get_texts_from_edms(edms_doc, fields_queue['counterparty'])

    contract = {
        'edms_doc_id': edms_doc.id,
        'company': edms_doc.company,
        'basic_contract': basic_contract,
        'number': get_contract_number(edms_doc, fields_queue),
        'subject': get_subject_from_edms(edms_doc, fields_queue['subject']),
        'counterparty': counterparty_id,
        'counterparty_text': counterparty_text,
        'nomenclature_group': get_texts_from_edms(edms_doc, fields_queue['nomenclature_group']),
        'date_start': get_days_from_edms(edms_doc, fields_queue['date_start']),
        'date_end': get_days_from_edms(edms_doc, fields_queue['date_end']),
        'responsible': None,
        'department': None,
        'lawyers_received': False,
        'incoterms': None,
        'purchase_terms': None,
    }

    new_contract_id = post_contract(edms_doc.employee_seat.employee.user_id, contract)
    doc_request.update({'contract': new_contract_id})
    post_files(files, doc_request)
    send_mail(doc_request)

    return new_contract_id


@try_except
def get_contract_number(edms_doc, fields_queue):
    if edms_doc.document_type_id >= 14:
        number = edms_doc.doc_registration.values_list('registration_number', flat=True) \
            .filter(document=edms_doc) \
            .filter(is_active=True)[0]
    else:
        number = get_texts_from_edms(edms_doc, fields_queue['number'])

    return number


@try_except
def get_subject_from_edms(edms_doc, queue):
    if edms_doc.document_type_id >= 20:
        doc_subject = Doc_Contract_Subject.objects.get(document=edms_doc)
        subject = doc_subject.contract_subject.name if doc_subject.contract_subject else doc_subject.text
    else:
        subject = get_texts_from_edms(edms_doc, queue),

    return subject


@try_except
def edit_contract(request):
    contract = json.loads(request.POST.get('contract'))
    contract['basic_contract'] = None if not contract['is_additional_contract'] else contract['basic_contract']
    contract['counterparty_link'] = contract['counterparty']

    contract_instance = get_object_or_404(Contract, pk=contract['id'])

    contract_instance.number = contract['number']
    contract_instance.company = contract['company']
    contract_instance.counterparty_link_id = contract['counterparty']
    contract_instance.updated_by = request.user
    contract_instance.subject = contract['subject']
    contract_instance.nomenclature_group = contract['nomenclature_group']
    contract_instance.date_start = contract['date_start'] if contract['date_start'] != '' else None
    contract_instance.date_end = contract['date_end'] if contract['date_end'] != '' else None
    contract_instance.responsible_id = contract['responsible'] if contract['responsible'] != 0 else None
    contract_instance.department_id = contract['department'] if contract['department'] != 0 else None
    contract_instance.lawyers_received = contract['lawyers_received']
    contract_instance.edms_doc_id = contract['edms_doc_id'] if contract['edms_doc_id'] != 0 else None
    contract_instance.incoterms = contract['incoterms'] if contract['incoterms'] != '' else None
    contract_instance.purchase_terms = contract['purchase_terms'] if contract['purchase_terms'] != '' else None
    contract_instance.basic_contract_id = contract['basic_contract']

    contract_instance.save()

    return contract_instance.pk


@try_except
def deactivate_contract(request, pk):
    contract_instance = get_object_or_404(Contract, pk=pk)
    contract_form = DeactivateContractForm(request, instance=contract_instance, initial={'is_active': False})
    if contract_form.is_valid():
        req = contract_form.save(commit=False)
        req.last_updated_by = request.user
        req.save()
    else:
        raise ValidationError('docs/api/contract_api: function deactivate_contract: form invalid')


@try_except
def post_files(files, doc_request):
    new_files = files.getlist('new_files')
    old_files = json.loads(doc_request['old_files']) if 'old_files' in doc_request else []

    # TODO доробити обробку відсутності old_files або signed_files

    signed_files = files.getlist('signed_files')
    contract = get_object_or_404(Contract, pk=doc_request['contract'])

    for file in new_files:
        Contract_File.objects.create(
            contract=contract,
            file=file,
            name=file.name
        )

    for file in old_files:
        if file['status'] == 'delete':
            deactivate_contract_file(doc_request, file)

    for file in signed_files:
        Contract_File.objects.create(
            contract=contract,
            file=file,
            name=file.name
        )


@try_except
def post_files_from_edms(files, post_request):
    signed_files = files.getlist('new_files')
    contract = get_object_or_404(Contract, pk=post_request['contract'])

    for file in signed_files:
        Contract_File.objects.create(
            contract=contract,
            file=file,
            name=file.name
        )


@try_except
def deactivate_contract_file(post_request, file):
    post_request.update({'is_active': False})
    file = get_object_or_404(Contract_File, pk=file['id'])
    form = DeactivateContractFileForm(post_request, instance=file)
    if form.is_valid():
        form.save()


@try_except
def get_main_contracts(company, counterparty_id):
    contracts = [{
        'id': contract.pk,
        'name': (contract.number if contract.number else 'б/н') + ', "' + contract.subject + '"',
        'company': contract.company
    } for contract in Contract.objects
        .filter(company=company)
        .filter(counterparty_link__id=counterparty_id)
        .filter(basic_contract__isnull=True)
        .filter(is_active=True)]
    return contracts


@try_except
def get_additional_contract_reg_number(main_contract_id):
    # Отримуємо номер договору і очищаємо його від лишніх символів
    main_contract = get_object_or_404(Contract, pk=main_contract_id)
    main_contract_number = " ".join(main_contract.number.split())
    main_contract_number = main_contract_number.replace("№", "")

    # Знаходимо кількість уже погоджених додаткових угод до цього договору, додаємо нумерацію
    add_contracts_count = Contract.objects.filter(basic_contract=main_contract).count()
    new_number = 'ДУ ' + main_contract_number + '/' + str(add_contracts_count + 1)

    # Перевіряємо унікальність цього номеру
    new_number_is_not_unique = Contract.objects.filter(number=new_number)
    if new_number_is_not_unique:
        return 'not unique'
    else:
        return new_number


@try_except
def check_lawyers_received(edms_doc_id):
    contract_instances = Contract.objects\
        .filter(edms_doc_id=edms_doc_id)\
        .filter(is_active=True)

    # Буває, що створюється два контракти по одному документу. Це глюк, який треба відслідкувати.
    # Поки що обходимо так: шукаємо всі дублікати контрактів, в один записуємо "Отримано",
    # всі інші деактивовуємо.

    contract_instance_counter = 0
    for contract in contract_instances:
        contract_instance_counter = contract_instance_counter + 1
        if contract_instance_counter > 1:
            contract.is_active = False
            contract.save()
        else:
            contract.lawyers_received = True
            contract.save()


