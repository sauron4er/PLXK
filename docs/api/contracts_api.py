import json
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from plxk.api.try_except import try_except
from docs.models import Contract, Contract_File
from docs.forms import NewContractForm, DeactivateContractForm, DeactivateContractFileForm


@try_except
def add_contract(request):
    contract = json.loads(request.POST.get('contract'))
    new_contract_form = NewContractForm(contract, initial={'nomenclature_group': None, 'date_end': None,
                                                           'department': None, 'responsible': None,
                                                           'lawyers_received': False, 'basic_contract': None})
    if new_contract_form.is_valid():
        new_contract = new_contract_form.save(commit=False)
        new_contract.created_by = request.user
        new_contract.save()
    else:
        raise ValidationError('docs/api/contract_api: function add_contract: form invalid')

    return new_contract.pk


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
        edit_contract.last_updated_by = request.user
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
def post_files(files, post_request):
    new_files = files.getlist('new_files')
    old_files = json.loads(post_request['old_files'])
    contract = get_object_or_404(Contract, pk=post_request['contract'])

    for file in new_files:
        Contract_File.objects.create(
            contract=contract,
            file=file,
            name=file.name
        )

    for file in old_files:
        if file['status'] == 'delete':
            deactivate_contract_file(post_request, file)


@try_except
def deactivate_contract_file(post_request, file):
    post_request.update({'is_active': False})
    file = get_object_or_404(Contract_File, pk=file['id'])
    form = DeactivateContractFileForm(post_request, instance=file)
    if form.is_valid():
        form.save()


# @try_except
# def get_contract_info(contract):
#     return '¹ ' + contract.number + contract.subject
