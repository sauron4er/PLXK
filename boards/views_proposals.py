from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.db import transaction
from datetime import datetime
from django.utils.timezone import get_current_timezone
import json
from plxk.api.try_except import try_except
from plxk.api.global_getters import get_my_seats
from plxk.api.datetime_normalizers import date_to_json
from plxk.api.convert_to_local_time import convert_to_localtime
from plxk.api.pagination import sort_query_set, filter_query_set
from .models import Proposal, Permission, Permission_Responsible



@login_required(login_url='login')
@try_except
def proposals(request):
    return render(request, 'boards/proposals/proposals.html')


@login_required(login_url='login')
@try_except
def get_proposals(request, page):
    proposals_query = Proposal.objects.filter(is_active=True)

    proposals_query = filter_query_set(proposals_query, json.loads(request.POST['filtering']))

    if request.POST['sort_name']:
        permissions_query = sort_query_set(proposals_query, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(proposals_query, 23)
    try:
        proposals_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        proposals_page = paginator.page(1)
    except EmptyPage:
        proposals_page = paginator.page(1)

    proposals_list = [{
        'id': proposal.pk,
        # 'category': permission.category.name,
        # 'department': permission.department.name,
        # 'name': permission.name,
        # 'date_next': convert_to_localtime(permission.date_next, 'day')
    } for proposal in proposals_page.object_list]

    response = {'rows': proposals_list, 'pagesCount': paginator.num_pages}


    response = {'rows': [], 'pagesCount': 1}

    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@try_except
def get_permission(request, pk):
    permission = Permission.objects.get(pk=pk)

    permission_fields = {
        'id': permission.pk,
        'category': permission.category.id,
        'category_name': permission.category.name,
        'department': permission.department.id,
        'department_name': permission.department.name,
        'name': permission.name,
        'info': permission.info,
        'comment': permission.comment,
        'date_next': date_to_json(permission.date_next),

        'responsibles': [{
            'responsible_id': responsible.id,
            'id': responsible.employee.id,
            'value': responsible.employee.pip,
            'status': 'old',
        } for responsible in Permission_Responsible.objects.filter(permission=permission).filter(is_active=True)]

        # 'old_files': [{
        #     'id': file.id,
        #     'file': file.file.name,
        #     'name': file.name,
        # } for file in Reclamation_file.objects.filter(reclamation_id=reclamation.id).filter(is_active=True)],
    }

    return HttpResponse(json.dumps(permission_fields))

@transaction.atomic
@login_required(login_url='login')
@try_except
def add_proposal(request):
    data = json.loads(request.POST.copy()['proposal'])

    if data['id'] == 0:
        proposal = Proposal(author=request.user.userprofile)
        proposal.author = request.user.userprofile
        employee_seats = get_my_seats(request.user.userprofile)
        proposal.department_id = employee_seats[0]['dep_id']
    else:
        proposal = Proposal.objects.get(pk=data['id'])

    proposal.name = data['name']
    proposal.text = data['text']
    proposal.incident = data['incident']

    if data['incident_date']:
        proposal.incident_date = data['incident_date']

    proposal.responsible_id = data['responsible']

    if data['deadline']:
        proposal.deadline = data['deadline']

    proposal.save()

    return HttpResponse(proposal.id)