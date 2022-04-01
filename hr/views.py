from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
import json
from plxk.api.try_except import try_except
from .api.api import get_instructions_list, get_regulations_list, \
    post_regulation, post_instruction, change_instruction, change_regulation


@login_required(login_url='login')
@try_except
def instructions(request):
    is_admin = 'true'
    # if request.user.userprofile.is_it_admin or request.user.userprofile.stationery_orders_view:
    #     is_admin = 'true'
    return render(request, 'hr/instructions/instructions.html', {'is_admin': is_admin})


@login_required(login_url='login')
@try_except
def get_regulations(request, page):
    regulations = get_regulations_list()
    return HttpResponse(json.dumps({'rows': regulations, 'pagesCount': 1}))


@login_required(login_url='login')
@try_except
def get_instructions(request, page):
    instructions = get_instructions_list()
    return HttpResponse(json.dumps({'rows': instructions, 'pagesCount': 1}))


@login_required(login_url='login')
@try_except
def add_or_change_regulation(request, pk):
    if pk == '0':
        regulation_id = change_regulation(request, pk)
    else:
        regulation_id = post_regulation(request)
    return HttpResponse(regulation_id)


@login_required(login_url='login')
@try_except
def add_or_change_instruction(request, pk):
    if pk == '0':
        instruction_id = change_instruction(request, pk)
    else:
        instruction_id = post_instruction(request)
    return HttpResponse(instruction_id)
