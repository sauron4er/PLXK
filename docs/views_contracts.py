from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.db import transaction
import json
from edms.models import Employee_Seat
from plxk.api.try_except import try_except
from .models import Contract, Contract_File
from plxk.api.datetime_normalizers import date_to_json
from docs.api import contracts_api, contracts_mail_sender
from plxk.api.convert_to_local_time import convert_to_localtime
from plxk.api.pagination import sort_query_set, filter_query_set
from plxk.api.global_getters import get_users_list, get_departments_list, is_it_lawyer, is_this_my_sub


@login_required(login_url='login')
@try_except
def index(request):
    return render(request, 'docs/contracts/index.html')


@login_required(login_url='login')
@try_except
def get_info_for_contracts_page(request):
    full_edit_access = is_it_lawyer(request.user.userprofile.id) or request.user.userprofile.is_it_admin

    return HttpResponse(json.dumps({'departments': get_departments_list(), 'employees': get_users_list(),
                                    'full_edit_access': 'true' if full_edit_access else 'false'}))


@login_required(login_url='login')
@try_except
def get_simple_contracts_list(request, counterparty, company):
    all_contracts = Contract.objects.filter(company=company).filter(is_active=True)

    if counterparty == '0':
        # При отриманні списку на сторінку Договорів фільтруємо по ТДВ-ТОВ.
        all_contracts = all_contracts.filter(company=company)
    else:
        # При отриманні списку на сторінку контрагента не фільтруємо по ТДВ, а тільки по контрагенту
        all_contracts = all_contracts.filter(counterparty_link_id=counterparty)

    contracts = [{
        'id': contract.id,
        'selector_info': '№ ' + (contract.number if contract.number else '---') + ', "' + contract.subject + '"',
    } for contract in all_contracts]

    return HttpResponse(json.dumps(contracts))


@try_except
def get_contracts(request, counterparty, company, with_add, page):
    all_contracts = Contract.objects.filter(is_active=True)

    if counterparty == '0':
        # При отриманні списку на сторінку Договорів фільтруємо по ТДВ-ТОВ.
        all_contracts = all_contracts.filter(company=company)
    else:
        # При отриманні списку на сторінку контрагента не фільтруємо по ТДВ, а тільки по контрагенту
        all_contracts = all_contracts.filter(counterparty_link_id=counterparty)

    if with_add == 'false':
        all_contracts = all_contracts.filter(basic_contract__isnull=True)

    full_edit_access = is_it_lawyer(request.user.userprofile.id) or request.user.userprofile.is_it_admin
    full_read_access = request.user.userprofile.access_to_all_contracts

    if full_edit_access or full_read_access:
        accessed_contracts = all_contracts
    else:
        users_department = Employee_Seat.objects.values_list('seat__department_id', flat=True) \
            .filter(employee=request.user.userprofile) \
            .filter(is_active=True).filter(is_main=True)[0]
        accessed_contracts = all_contracts.filter(created_by=request.user) | all_contracts.filter(
            department_id=users_department)

    contracts = accessed_contracts
    contracts = filter_query_set(contracts, json.loads(request.POST['filtering']))
    contracts = sort_query_set(contracts, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(contracts, 22)
    try:
        contracts_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        contracts_page = paginator.page(1)
    except EmptyPage:
        contracts_page = paginator.page(1)

    contracts_list = [{
        'id': contract.id,
        'number': contract.number if contract.number else 'б/н',
        'subject': contract.subject,
        'selector_info': '№ ' + (contract.number if contract.number else '---') + ', "' + contract.subject + '"',
        'counterparty_link__name': contract.counterparty_link.name if contract.counterparty_link else contract.counterparty,
        'counterparty_link__edrpou': contract.counterparty_link.edrpou if contract.counterparty_link else '',
        'date_start': convert_to_localtime(contract.date_start, 'day') if contract.date_start else '',
        'date_end': convert_to_localtime(contract.date_end, 'day') if contract.date_end else '',
        # 'responsible_name': contract.responsible.last_name + ' ' + contract.responsible.first_name if contract.responsible else '',
        'files': [{
            'id': file.id,
            'file': file.file.name,
            'name': file.name
        } for file in Contract_File.objects
            .filter(contract=contract.id)
            .filter(is_active=True)]
    } for contract in contracts_page.object_list]

    response = {'rows': contracts_list, 'pagesCount': paginator.num_pages}
    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@try_except
def get_additional_contracts(request, pk):
    additional_contracts = [{
        'id': contract.id,
        'number': contract.number,
        'subject': contract.subject
    } for contract in Contract.objects.filter(basic_contract_id=pk).filter(is_active=True)]

    return HttpResponse(json.dumps(additional_contracts))


@login_required(login_url='login')
@try_except
def get_contract(request, pk):
    contract = get_object_or_404(Contract, pk=pk)

    is_author = request.user == contract.created_by

    read_access = is_author \
                  or request.user.userprofile.is_it_admin \
                  or request.user.userprofile.access_to_all_contracts \
                  or is_it_lawyer(request.user.userprofile.id) \
                  or is_this_my_sub(request.user, contract.created_by)

    contract = {
        'id': contract.id,
        'number': contract.number if contract.number else 'б/н',
        'company': contract.company,
        'author': contract.created_by.id,
        'author_name': contract.created_by.last_name + ' ' + contract.created_by.first_name,
        'subject': contract.subject,
        'counterparty': contract.counterparty_link_id if contract.counterparty_link_id else 0,
        'counterparty_name': contract.counterparty_link.name if contract.counterparty_link else '',
        'counterparty_old': '' if contract.counterparty_link_id else contract.counterparty,
        'nomenclature_group': contract.nomenclature_group if contract.nomenclature_group else '',
        'date_start': date_to_json(contract.date_start) if contract.date_start else '',
        'date_end': date_to_json(contract.date_end) if contract.date_end else '',
        'responsible': contract.responsible_id if contract.responsible_id else 0,
        'responsible_name': contract.responsible.last_name + ' ' + contract.responsible.first_name if contract.responsible else '',
        'department': contract.department_id if contract.department_id else 0,
        'department_name': contract.department.name if contract.department else '',
        'lawyers_received': contract.lawyers_received,
        'is_additional_contract': contract.basic_contract is not None,
        'basic_contract': contract.basic_contract_id if contract.basic_contract_id else 0,
        'basic_contract_subject':
            '№ ' + contract.basic_contract.number + ', "' + contract.basic_contract.subject + '"'
            if contract.basic_contract else '',
        'edms_doc_id': contract.edms_doc_id if contract.edms_doc else 0,
        'incoterms': contract.incoterms or '',
        'purchase_terms': contract.purchase_terms or '',
        'is_author': request.user == contract.created_by
    }

    old_files = [{
        'id': file.id,
        'name': file.name,
        'file': file.file.name,
        'status': 'old'
    } for file in Contract_File.objects.filter(is_active=True).filter(contract__id=contract['id'])]

    contract.update({'old_files': old_files, 'new_files': []})

    return HttpResponse(json.dumps({'contract': contract, 'is_author': is_author, 'read_access': read_access}))


@transaction.atomic
@login_required(login_url='login')
@try_except
def add_contract(request):
    doc_request = request.POST.copy()

    new_contract_id = contracts_api.add_contract(request)
    doc_request.update({'contract': new_contract_id})

    contracts_api.post_files(request.FILES, doc_request)
    contracts_mail_sender.send_mail(doc_request)

    return HttpResponse(new_contract_id)


@transaction.atomic
@login_required(login_url='login')
@try_except
def edit_contract(request):
    doc_request = request.POST.copy()

    contract_id = contracts_api.edit_contract(request)
    doc_request.update({'contract': contract_id})

    contracts_api.post_files(request.FILES, doc_request)

    return HttpResponse(contract_id)


@login_required(login_url='login')
@transaction.atomic
@try_except
def deactivate_contract(request, pk):
    contracts_api.deactivate_contract(request, pk)
    return HttpResponse()
