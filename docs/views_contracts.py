from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
import json

from plxk.api.try_except import try_except
from plxk.api.global_getters import get_employees_list
from plxk.api.datetime_normalizers import date_to_json
from .models import Contract, Contract_File


@login_required(login_url='login')
@try_except
def index(request):
    # if request.user.id:
        # is_contracts_admin = Працює у відділі ЮАВ
    # else:
    #     is_contracts_admin = [False]

    # Переробляємо True у 'true', так його зрозуміє js
    # is_contracts_admin = 'true' if True in is_contracts_admin else 'false'

    # Перевіряємо, чи користувач Генеральний директор, працює в ЮАВ, директор з безпеки.
    # Якщо так, показуємо йому всі Договори, якщо ні - то тільки ті, які відносяться до його відділу,
    # ті, в яких він вказаний відповідальною особою та ті, що створені ним

    employees = get_employees_list()

    contracts = [{
        'id': contract.id,
        'number': contract.number,
        # 'author_id': contract.created_by.id,
        # 'author': contract.created_by.last_name + ' ' + contract.created_by.first_name,
        'subject': contract.subject,
        'counterparty': contract.counterparty,
        # 'nomenclature_group': contract.nomenclature_group,
        'date_start': date_to_json(contract.date_start),
        'date_end': date_to_json(contract.date_end),
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
    } for contract in Contract.objects.filter(is_active=True)]

    return render(request, 'docs/contracts/index.html', {'contracts': contracts,
                                                         'is_contracts_admin': 'true',
                                                         'employees': employees})


@login_required(login_url='login')
@try_except
def get_contract(request, pk):
    contract = get_object_or_404(Contract, pk=pk)

    contract = {
        'id': contract.id,
        'number': contract.number,
        'author_id': contract.created_by.id,
        'author': contract.created_by.last_name + ' ' + contract.created_by.first_name,
        'subject': contract.subject,
        'counterparty': contract.counterparty,
        'nomenclature_group': contract.nomenclature_group,
        'date_start': date_to_json(contract.date_start),
        'date_end': date_to_json(contract.date_end),
        'responsible_id': contract.responsible_id,
        'responsible': contract.responsible.last_name + ' ' + contract.responsible.first_name,
        'department': contract.department,
        'lawyers_received': 'true' if contract.lawyers_received else 'false',
        'basic_contract_id': contract.basic_contract_id,
        'basic_contract_subject': contract.basic_contract,
    }

    old_files = [{
        'id': file.id,
        'name': file.name,
        'file': file.file.name
    } for file in Contract_File.objects.filter(is_active=True).filter(contract__id=contract['id'])]

    contract.update({'old_files': old_files, 'files': []})

    return HttpResponse(json.dumps(contract))
