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
    proposals_query = Proposal.objects.filter(is_active=True).order_by('-id')

    proposals_query = filter_query_set(proposals_query, json.loads(request.POST['filtering']))

    if request.POST['sort_name']:
        proposals_query = sort_query_set(proposals_query, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(proposals_query, 23)
    try:
        proposals_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        proposals_page = paginator.page(1)
    except EmptyPage:
        proposals_page = paginator.page(1)

    proposals_list = [{
        'id': proposal.pk,
        'name': proposal.name,
        'author': proposal.author.pip,
        'deadline': date_to_json(proposal.deadline),
        'responsible': proposal.responsible.pip,
        'is_done': 'Виконано' if proposal.is_done else '',
    } for proposal in proposals_page.object_list]

    response = {'rows': proposals_list, 'pagesCount': paginator.num_pages}

    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@try_except
def get_proposal(request, pk):
    proposal = Proposal.objects.get(pk=pk)

    proposal_fields = {
        'id': proposal.pk,
        'author': proposal.author.id,
        'author_name': proposal.author.pip,
        'name': proposal.name,
        'text': proposal.text,
        'incident': proposal.incident if proposal.incident else '',
        'incident_date': date_to_json(proposal.incident_date) if proposal.incident_date else '',
        'deadline': date_to_json(proposal.deadline) if proposal.deadline else '',
        'responsible': proposal.responsible.id,
        'responsible_name': proposal.responsible.pip,
        'editing_allowed': is_editing_allowed(request.user, proposal),
        'is_done': proposal.is_done,
    }

    return HttpResponse(json.dumps(proposal_fields))


@try_except
def is_editing_allowed(user, proposal):
    if user.userprofile.is_it_admin:
        return True

    if user.userprofile == proposal.author:
        return True

    my_seats = get_my_seats(user.userprofile)
    for seat in my_seats:
        if seat['seat_id'] in [16, 247, 281]:  # Директори
            return True
        if seat['seat_id'] == 42:  # Директор з якості та екології
            return True
        if seat['seat_id'] == 92:  # Начальник СОП
            return True
        if seat['seat_id'] == 97:  # Менеджер зі СМЯ
            return True
    return False


@transaction.atomic
@login_required(login_url='login')
@try_except
def post_proposal(request):
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
    proposal.is_done = data['is_done']

    if data['incident_date']:
        proposal.incident_date = data['incident_date']

    proposal.responsible_id = data['responsible']

    if data['deadline']:
        proposal.deadline = data['deadline']

    proposal.save()

    return HttpResponse(proposal.id)