from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.db import transaction
from django.db.models import Q
import json
import re
from edms.models import Employee_Seat
from edms.api.contract_reg_numbers import get_contract_reg_numbers_list
from plxk.api.try_except import try_except
from .models import Contract, Contract_File, Contract_Reg_Number
from .api.contracts_api import add_contract_api, edit_contract_api, deactivate_contract_api, post_files, \
    arrange_reg_journal, add_missing_contract_info, trim_spaces, delete_number_symbol, write_sequence_numbers, \
    add_sequence_number, link_additional_contracts_to_basic, reg_journal_create_excel
from plxk.api.datetime_normalizers import date_to_json, normalize_date
from docs.api import contracts_mail_sender
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
def get_simple_contracts_list(request, counterparty, company, only_main=True):
    all_contracts = Contract.objects.filter(company=company).filter(is_active=True)

    if only_main:
        all_contracts = all_contracts.filter(basic_contract__isnull=True)

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
        accessed_contracts = all_contracts.filter(created_by=request.user) | all_contracts.filter(department_id=users_department)

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

    new_contract_id = add_contract_api(request)
    doc_request.update({'contract': new_contract_id})

    post_files(request.FILES, doc_request)
    contracts_mail_sender.send_mail(doc_request)

    return HttpResponse(new_contract_id)


@transaction.atomic
@login_required(login_url='login')
@try_except
def edit_contract(request):
    doc_request = request.POST.copy()

    contract_id = edit_contract_api(request)
    doc_request.update({'contract': contract_id})

    post_files(request.FILES, doc_request)

    return HttpResponse(contract_id)


@login_required(login_url='login')
@transaction.atomic
@try_except
def deactivate_contract(request, pk):
    deactivate_contract_api(request, pk)
    return HttpResponse()


# ----------------------------------------- Contract reg numbers
@login_required(login_url='login')
@try_except
def contract_reg_numbers(request):
    return render(request, 'docs/contracts/registration_numbers_edms/index.html')


# ----------------------------------------- Contract registration journal
@login_required(login_url='login')
@try_except
def contracts_reg_journal(request):
    # write_sequence_numbers()  # TODO - comment after first use after word import
    trim_spaces()
    delete_number_symbol()
    link_additional_contracts_to_basic()
    add_missing_contract_info()  # every time start function, that ties new contract numbers with contracts in database
    edit_access = request.user.userprofile.is_it_admin or request.user.userprofile.department_id == 50
    return render(request, 'docs/contracts/registration_journal/index.html', {'edit_access': json.dumps(edit_access)})


@try_except
def get_reg_journal(request, page):
    reg_journal = arrange_reg_journal(request, page)
    return HttpResponse(json.dumps(reg_journal))


@try_except
def edit_reg_journal_number(request, reg_id):
    if reg_id != '0':
        reg_number_instance = Contract_Reg_Number.objects.get(id=reg_id)
    else:
        reg_number_instance = Contract_Reg_Number()

    reg_number_instance.number = request.POST['auto_number'] if len(request.POST['auto_number']) else request.POST['manual_number'].strip()
    reg_number_instance.type = request.POST['type']
    reg_number_instance.date = request.POST['date']
    reg_number_instance.counterparty_id = request.POST['counterparty_id']
    reg_number_instance.subject = request.POST['subject']
    reg_number_instance.responsible_id = request.POST['responsible_id']
    reg_number_instance.company = request.POST['company']
    reg_number_instance.contract = None  # let system tie contract again in case of changed number
    reg_number_instance.save()

    add_sequence_number(reg_number_instance, request.POST['sequence_number'])

    return HttpResponse('')


@try_except
def get_next_sequence_number(request):
    last_sequence_number = (Contract_Reg_Number.objects
                            .values_list('sequence_number', flat=True)
                            .filter(type=request.POST['type'])
                            .filter(company=request.POST['company'])
                            .filter(date__year=request.POST['year'])
                            .filter(is_active=True)
                            .order_by('-sequence_number')
                            .first()) or '0'

    next_sequence_number = str(int(last_sequence_number) + 1)

    if len(next_sequence_number) == 1:
        next_sequence_number = '00' + next_sequence_number
    elif len(next_sequence_number) == 2:
        next_sequence_number = '0' + next_sequence_number

    return HttpResponse(next_sequence_number)


@try_except
def get_next_additional_contract_number(request, basic_contract_id):
    new_number = ''
    sequence_number = ''
    basic_and_siblings = []

    basic_contract_number = Contract.objects.values_list('number', flat=True).filter(id=basic_contract_id)
    try:
        basic_contract_reg_instance = Contract_Reg_Number.objects.get(contract_id=basic_contract_id)

        if basic_contract_reg_instance:
            basic = {
                'id': basic_contract_reg_instance.contract_id,
                'number': basic_contract_reg_instance.number,
                'subject': basic_contract_reg_instance.subject,
                'date': normalize_date(basic_contract_reg_instance.date),
                'basic': True
            }

            sequence_number = basic_contract_reg_instance.sequence_number

            number_of_additionals = Contract_Reg_Number.objects \
                .filter(basic_contract_number=basic_contract_reg_instance) \
                .filter(is_active=True).count()
            new_number = 'ДУ ' + str(basic_contract_number[0]) + '/' + str(number_of_additionals + 1)

            siblings_query = Contract_Reg_Number.objects.filter(basic_contract_number=basic_contract_reg_instance).filter(is_active=True)

            siblings = [{
                'id': entry.contract_id,
                'number': entry.number,
                'subject': entry.subject,
                'date': normalize_date(entry.date),
                'basic': False
            } for entry in siblings_query]

            basic_and_siblings = [basic] + siblings
    except Contract_Reg_Number.DoesNotExist:
        new_number = ''
        sequence_number = ''
        basic_and_siblings = []

    return HttpResponse(json.dumps({'new_number': new_number,
                                    'sequence_number': sequence_number,
                                    'basic_and_siblings': basic_and_siblings}))


@try_except
def delete_reg_journal_number(request, reg_id):
    reg_number_instance = Contract_Reg_Number.objects.get(id=reg_id)
    reg_number_instance.is_active = False
    reg_number_instance.save()
    return HttpResponse('')


@try_except
def get_last_ten_reg_numbers(request):
    last_ten_numbers = (Contract_Reg_Number.objects
                            .filter(type=request.POST['type'])
                            .filter(company=request.POST['company'])
                            .filter(date__year=request.POST['year'])
                            .filter(is_active=True)
                            .order_by('-sequence_number'))[:10]

    last_ten_numbers_list = [{
        'id': entry.id,
        'contract_id': entry.contract_id or '',
        'number': entry.number,
        'counterparty': entry.counterparty.name if entry.counterparty else '',
        'subject': entry.subject,
        'date': normalize_date(entry.date)
    } for entry in last_ten_numbers]

    return HttpResponse(json.dumps(last_ten_numbers_list))


@try_except
@login_required()
def create_excel(request):
    edit_access = request.user.userprofile.is_it_admin or request.user.userprofile.department_id == 50
    if edit_access:
        filename = reg_journal_create_excel()
        return HttpResponse(filename)


# ----------------------------------------- Contract reg numbers
@login_required(login_url='login')
@try_except
def get_contract_reg_numbers(request, page):
    response = get_contract_reg_numbers_list(request, page)
    return HttpResponse(json.dumps(response))
