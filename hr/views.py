from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
import json
from plxk.api.try_except import try_except
from .api.regulations_api import get_regulations_list, post_regulation, post_regulation_file, change_regulation
from .api.instructions_api import get_instructions_list, post_instruction, post_instruction_file, change_instruction


@login_required(login_url='login')
@try_except
def instructions(request):
    if request.user.userprofile.is_it_admin or request.user.userprofile.is_hr:
        is_hr_admin = 'true'
    else:
        is_hr_admin = 'false'
    return render(request, 'hr/instructions/instructions.html', {'is_hr_admin': is_hr_admin})


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
        doc_request.update({'id': regulation_id})
    else:
        regulation_id = change_regulation(request, pk)

    post_regulation_file(request.FILES, doc_request)
    return HttpResponse(regulation_id)


@login_required(login_url='login')
@try_except
def add_or_change_instruction(request, pk):
    doc_request = request.POST.copy()

    if pk == '0':
        instruction_id = post_instruction(request)
        doc_request.update({'id': instruction_id})
    else:
        instruction_id = change_instruction(request, pk)

    post_instruction_file(request.FILES, doc_request)
    return HttpResponse(instruction_id)


@login_required(login_url='login')
@try_except
def get_regulation(request, pk):
    a=1


@login_required(login_url='login')
@try_except
def get_instruction(request, pk):
    a=1
