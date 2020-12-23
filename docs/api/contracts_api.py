import json
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from plxk.api.try_except import try_except
from docs.models import Contract, Contract_File
from docs.forms import NewContractForm, DeactivateContractForm, DeactivateContractFileForm
from edms.models import Document, Document_Type_Module
from docs.api.contracts_mail_sender import send_mail


@try_except
def add_contract(request):
    contract = json.loads(request.POST.get('contract'))
    contract.update({'edms_doc': None})
    contract.update({'created_by': request.user})
    return post_contract(contract)


@try_except
def post_contract(contract):
    new_contract_form = NewContractForm(contract, initial={'number': None, 'nomenclature_group': None, 'date_end': None,
                                                           'department': None, 'responsible': None,
                                                           'lawyers_received': False, 'basic_contract': None})

    if new_contract_form.is_valid():
        new_contract = new_contract_form.save(commit=False)
        new_contract.created_by = contract['created_by']
        new_contract.edms_doc = contract['edms_doc']
        new_contract.save()
    else:
        raise ValidationError('docs/api/contract_api: function post_contract: form invalid')

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
def add_contract_from_edms(doc_request, files, doc_author):
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

    contract = {
        'edms_doc': edms_doc,
        'company': edms_doc.company,
        'basic_contract': basic_contract,
        'number': get_texts_from_edms(edms_doc, fields_queue['number']),
        'subject': get_texts_from_edms(edms_doc, fields_queue['subject']),
        'counterparty': get_texts_from_edms(edms_doc, fields_queue['counterparty']),
        'nomenclature_group': get_texts_from_edms(edms_doc, fields_queue['nomenclature_group']),
        'date_start': get_days_from_edms(edms_doc, fields_queue['date_start']),
        'date_end': get_days_from_edms(edms_doc, fields_queue['date_end']),
        'created_by': doc_author,
    }

    new_contract_id = post_contract(contract)
    doc_request.update({'contract': new_contract_id})
    post_files(files, doc_request)
    send_mail(doc_request)

    return new_contract_id


@try_except
def edit_contract(request):
    contract = json.loads(request.POST.get('contract'))
    contract['department'] = None if contract['department'] == 0 else contract['department']
    contract['responsible'] = None if contract['responsible'] == 0 else contract['responsible']
    contract['basic_contract'] = None if not contract['is_additional_contract'] else contract['basic_contract']

    req_instance = get_object_or_404(Contract, pk=contract['id'])

    edit_contract_form = NewContractForm(contract, instance=req_instance, initial={'nomenclature_group': None,
                                                                                   'date_end': None, 'department': None,
                                                                                   'responsible': None, 'lawyers_received': False,
                                                                                   'basic_contract': None})
    if edit_contract_form.is_valid():
        edit_contract = edit_contract_form.save(commit=False)
        edit_contract.updated_by = request.user
        edit_contract.save()
    else:
        raise ValidationError('docs/api/contract_api: function edit_contract: form invalid')

    return edit_contract.pk


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
