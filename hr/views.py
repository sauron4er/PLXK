from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
import json
from plxk.api.try_except import try_except


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
    regulations = [{'id': 1, 'department': 'IT', 'file': ''}]
    return HttpResponse(json.dumps({'rows': regulations, 'pagesCount': 1}))


@login_required(login_url='login')
@try_except
def get_instructions(request, page):
    instructions_list = [{'id': 1, 'department': 'IT', 'seat': 'Системний адмін', 'file': ''}]
    return HttpResponse(json.dumps({'rows': instructions_list, 'pagesCount': 1}))
