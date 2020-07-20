from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
import json

from plxk.api.try_except import try_except
from plxk.api.global_getters import get_employees_list, get_departments_list, is_it_lawyer
from plxk.api.datetime_normalizers import date_to_json
from .models import Contract, Contract_File
from docs.api import contracts_api, contracts_mail_sender


@login_required(login_url='login')
@try_except
def index(request):
    all_contracts = Contract.objects.filter(is_active=True)
    accessed_contracts = []

    # TODO Подавати весь список документів тільки при full_edit_access або full_read_access,
    #  в іншому разі шукати лише документи, які пов’язані з людиною особисто або через відділ

    full_edit_access = is_it_lawyer(request.user.userprofile.id) or request.user.userprofile.is_it_admin
    full_read_access = request.user.userprofile.access_to_all_contracts

    if full_edit_access or full_read_access:
        accessed_contracts = all_contracts
    else:
        accessed_contracts = all_contracts.filter(created_by=request.user)

    contracts = [{
        'id': contract.id,
        'number': contract.number,
        # 'author_id': contract.created_by.id,
        # 'author': contract.created_by.last_name + ' ' + contract.created_by.first_name,
        'subject': contract.subject,
        'selector_info': '№ ' + contract.number + ', "' + contract.subject + '"',
        'counterparty': contract.counterparty,
        # 'nomenclature_group': contract.nomenclature_group,
        'date_start': date_to_json(contract.date_start),
        'date_end': date_to_json(contract.date_end) if contract.date_end else '',
        # 'responsible_id': contract.responsible_id,
        # 'responsible': contract.responsible.last_name + ' ' + contract.responsible.first_name,
        # 'department': contract.department,
        # 'lawyers_received': 'true' if contract.lawyers_received else 'false',
        # 'basic_contract_id': contract.basic_contract_id,
        # 'basic_contract_subject': contract.basic_contract,
        'files': [{
            'id': file.id,
            'file': file.file.name,
            'name': file.name
        } for file in Contract_File.objects
            .filter(contract=contract.id)
            .filter(is_active=True)]
    } for contract in accessed_contracts]

    return render(request, 'docs/contracts/index.html', {'contracts': contracts,
                                                         'departments': get_departments_list(),
                                                         'employees': get_employees_list(),
                                                         'full_edit_access': 'true' if full_edit_access else 'false'
                                                         })


@login_required(login_url='login')
@try_except
def get_contract(request, pk):
    contract = get_object_or_404(Contract, pk=pk)

    contract = {
        'id': contract.id,
        'number': contract.number,
        'author': contract.created_by.id,
        'author_name': contract.created_by.last_name + ' ' + contract.created_by.first_name,
        'subject': contract.subject,
        'counterparty': contract.counterparty,
        'nomenclature_group': contract.nomenclature_group,
        'date_start': date_to_json(contract.date_start),
        'date_end': date_to_json(contract.date_end) if contract.date_end else '',

        'responsible': contract.responsible_id if contract.responsible_id else 0,
        'responsible_name': contract.responsible.last_name + ' ' + contract.responsible.first_name if contract.responsible else '',
        'department': contract.department_id if contract.department_id else 0,
        'department_name': contract.department.name if contract.department else '',
        'lawyers_received': contract.lawyers_received,
        'is_additional_contract': contract.basic_contract is not None,
        'basic_contract': contract.basic_contract_id if contract.basic_contract_id else 0,
        'basic_contract_subject': '№ ' + contract.number + ', "' + contract.subject + '"' if contract.basic_contract else '',
    }

    old_files = [{
        'id': file.id,
        'name': file.name,
        'file': file.file.name,
        'status': 'old'
    } for file in Contract_File.objects.filter(is_active=True).filter(contract__id=contract['id'])]

    contract.update({'old_files': old_files, 'new_files': []})

    return HttpResponse(json.dumps(contract))


@login_required(login_url='login')
@try_except
def add_contract(request):
    post_request = request.POST.copy()

    new_contract_id = contracts_api.add_contract(request)
    post_request.update({'contract': new_contract_id})

    contracts_api.post_files(request.FILES, post_request)
    contracts_mail_sender.send_mail(post_request)

    return HttpResponse(new_contract_id)


@login_required(login_url='login')
@try_except
def edit_contract(request):
    post_request = request.POST.copy()

    contract_id = contracts_api.edit_contract(request)
    post_request.update({'contract': contract_id})

    contracts_api.post_files(request.FILES, post_request)

    return HttpResponse()
