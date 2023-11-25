from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
import json
from plxk.api.try_except import try_except
from .api.regulations_api import get_regulations_list, post_regulation, post_regulation_file, \
    change_regulation, get_regulation_api, deact_regulation_api, get_dep_list_for_regulations
from .api.instructions_api import get_instructions_list, post_instruction, post_instruction_file, \
    change_instruction, get_instruction_api, deact_instruction_api, get_dep_seat_list_for_instruction, get_seat_instruction_files
from .api.org_structure_api import get_org_structure, add_department
from edms.api.getters import get_employees_by_seat
from accounts.api.setters import dep_name_change_api


@login_required(login_url='login')
@try_except
def get_deps_for_regulations(request):
    return HttpResponse(json.dumps(get_dep_list_for_regulations()))


@login_required(login_url='login')
@try_except
def get_dep_seats_for_instruction(request, dep_id):
    return HttpResponse(json.dumps(get_dep_seat_list_for_instruction(dep_id)))


@login_required(login_url='login')
@try_except
def instructions(request):
    edit_enabled = 'true' if request.user.userprofile.is_it_admin \
                             or request.user.userprofile.is_hr \
                             or request.user.userprofile.dep_regulations_add \
                             else 'false'
    return render(request, 'hr/instructions/index.html', {'edit_enabled': edit_enabled})


@login_required(login_url='login')
@try_except
def get_regulations(request):
    regulations_list = get_regulations_list()
    return HttpResponse(json.dumps(regulations_list))


@login_required(login_url='login')
@try_except
def get_instructions(request):
    instructions_list = get_instructions_list()
    return HttpResponse(json.dumps(instructions_list))


@login_required(login_url='login')
@try_except
def add_or_change_regulation(request, pk):
    doc_request = request.POST.copy()

    if pk == '0':
        regulation_id = post_regulation(request)
    else:
        regulation_id = change_regulation(request, pk)

    doc_request.update({'id': regulation_id})
    post_regulation_file(request.FILES, doc_request)
    return HttpResponse(regulation_id)


@login_required(login_url='login')
@try_except
def add_or_change_instruction(request, pk):
    doc_request = request.POST.copy()

    if pk == '0':
        instruction_id = post_instruction(request)
    else:
        instruction_id = change_instruction(request, pk)

    doc_request.update({'id': instruction_id})
    post_instruction_file(request.FILES, doc_request)
    return HttpResponse(instruction_id)


@login_required(login_url='login')
@try_except
def get_regulation(request, pk):
    return HttpResponse(json.dumps(get_regulation_api(pk)))


@login_required(login_url='login')
@try_except
def deact_regulation(request, pk):
    deact_regulation_api(pk)
    return HttpResponse(200)


@login_required(login_url='login')
@try_except
def get_instruction(request, pk):
    return HttpResponse(json.dumps(get_instruction_api(pk)))


@login_required(login_url='login')
@try_except
def deact_instruction(request, pk):
    deact_instruction_api(pk)
    return HttpResponse(200)


@login_required(login_url='login')
@try_except
def org_structure(request):
    edit_enabled = 'true' if request.user.userprofile.is_it_admin \
                             or request.user.userprofile.is_hr \
                             or request.user.userprofile.dep_regulations_add \
                             else 'false'
    departments = get_org_structure()
    return render(request, 'hr/org_structure/index.html', {'edit_enabled': edit_enabled,
                                                           'departments': json.dumps(departments)})


@login_required(login_url='login')
@try_except
def post_department(request):
    new_dep_id = add_department(request)
    return HttpResponse(200)


@login_required(login_url='login')
@try_except
def get_seat(request, pk):
    instruction_files = get_seat_instruction_files(pk)
    employees = get_employees_by_seat(pk)
    return HttpResponse(json.dumps({'instruction_files': instruction_files, 'employees': employees}))


@login_required(login_url='login')
@try_except
def dep_name_change(request, pk, new_name):
    dep_name_change_api(pk, new_name)
    return HttpResponse(200)
