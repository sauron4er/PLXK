from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.db import transaction
from datetime import datetime
from django.utils.timezone import get_current_timezone
import json
from edms.models import Employee_Seat
from plxk.api.try_except import try_except
from plxk.api.datetime_normalizers import date_to_json
from plxk.api.convert_to_local_time import convert_to_localtime
from plxk.api.global_getters import get_dep_chief, get_director_userprofile, get_quality_director
from plxk.api.pagination import sort_query_set, filter_query_set
from .models import Reclamation, Reclamation_file, Reclamation_decision
from .models import Permission, Permission_Date, Permission_Category
from .api.reclamation_mail_sender import create_and_send_mail



@login_required(login_url='login')
@try_except
def permissions(request):
    return render(request, 'boards/permissions/permissions.html')


@login_required(login_url='login')
@try_except
def get_permissions(request, page):
    a=1
    return render(request, 'boards/permissions/permissions.html')


@try_except
def get_reclamations(request, counterparty, page):
    reclamations_query = Reclamation.objects.filter(is_active=True)

    if counterparty != '0':
        # При отриманні списку на сторінці контрагента фільтруємо по контрагенту
        reclamations_query = reclamations_query.filter(client_id=counterparty)

    reclamations_query = filter_query_set(reclamations_query, json.loads(request.POST['filtering']))
    reclamations_query = sort_query_set(reclamations_query, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(reclamations_query, 23)
    try:
        ncs_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        ncs_page = paginator.page(1)
    except EmptyPage:
        ncs_page = paginator.page(1)

    reclamations_list = [{
        'id': reclamation.pk,
        'client': reclamation.client.name,
        'product': reclamation.product.name,
        'car_number': reclamation.car_number,
        'author': reclamation.author.pip,
        'responsible': reclamation.responsible.pip if reclamation.responsible else '',
        'status': 'ok' if reclamation.phase == 4 else '' if reclamation.phase == 666 else 'in progress'
    } for reclamation in ncs_page.object_list]

    response = {'rows': reclamations_list, 'pagesCount': paginator.num_pages}
    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@try_except
def get_permission(request, pk):
    a=1
    return render(request, 'boards/permissions/permissions.html')


@login_required(login_url='login')
@try_except
def get_reclamation(request, pk):
    reclamation = Reclamation.objects.get(pk=pk)

    reclamation_fields = {
        'id': reclamation.id,
        'phase': reclamation.phase,
        'author_name': reclamation.author.pip,
        'date_added': date_to_json(reclamation.date_db_added),
        'department_name': reclamation.department.name,
        'dep_chief': reclamation.dep_chief_id,
        'dep_chief_name': reclamation.dep_chief.pip,
        'dep_chief_approved': reclamation.dep_chief_approved or '',
        'product_type': reclamation.product.type.id,
        'product_type_name': reclamation.product.type.name,
        'product': reclamation.product.id,
        'product_name': reclamation.product.name,
        'client': reclamation.client.id,
        'client_name': reclamation.client.name,
        'reason': reclamation.reason,
        'car_number': reclamation.car_number,
        'date_manufacture': date_to_json(reclamation.date_manufacture),
        'date_shipment': date_to_json(reclamation.date_shipment),
        'date_received': date_to_json(reclamation.date_received),

        'old_files': [{
            'id': file.id,
            'file': file.file.name,
            'name': file.name,
        } for file in Reclamation_file.objects.filter(reclamation_id=reclamation.id).filter(is_active=True)],

        'decisions': [{
            'id': decision.id,
            'user': decision.user_id,
            'user_name': decision.user.pip,
            'decision': decision.decision or '',
            'decision_time': convert_to_localtime(decision.decision_time, 'time') if decision.decision_time else '',
            'phase': decision.phase
        } for decision in Reclamation_decision.objects.filter(reclamation=reclamation).filter(is_active=True)],

        'final_decisioner': get_director_userprofile(),
        'final_decision': reclamation.final_decision or '',
        'final_decision_time': convert_to_localtime(reclamation.final_decision_time, 'day') if reclamation.final_decision_time else '',
        'responsible': reclamation.responsible.id if reclamation.responsible else 0,
        'responsible_name': reclamation.responsible.pip if reclamation.responsible else '',
        'answer_responsible_dep': reclamation.answer_responsible_dep.id if reclamation.answer_responsible_dep else '',
        'answer_responsible_dep_name': reclamation.answer_responsible_dep.name if reclamation.answer_responsible_dep else '',
        'quality_director_name': get_quality_director('name'),


    }

    user_role = 'viewer'
    if reclamation.responsible and reclamation.responsible_id == request.user.userprofile.id:
        user_role = 'responsible'
    elif get_dep_chief(reclamation.author) == request.user.userprofile:
        user_role = 'dep_chief'
    elif reclamation.author.user == request.user:
        user_role = 'author'
    elif get_director_userprofile('id') == request.user.userprofile.id:
        user_role = 'director'

    return HttpResponse(json.dumps({'reclamation': reclamation_fields, 'user_role': user_role}))


@transaction.atomic
@login_required(login_url='login')
@try_except
def post_permission(request):
    data = json.loads(request.POST.copy()['permission'])

    if data['id'] == 0:
        permission = Permission(author=request.user.userprofile)
    else:
        permission = Permission.objects.get(pk=data['id'])

    permission.author = request.user.userprofile
    permission.category = data['category']
    permission.department = data['department']
    permission.name = data['name']
    permission.info = data['info']
    permission.comment = data['comment']

    # post_files(permission, request.FILES, data['old_files'])
    post_dates(permission, data['dates'])

    if data['responsibles']:
        post_responsibles(permission, data['responsibles'])

    return HttpResponse('ok')


# @try_except
# def post_files(permission, new_files, old_files):
#     for file in new_files.getlist('new_files'):
#         Permission_File.objects.create(
#             permission=permission,
#             file=file,
#             name=file.name
#         )


@try_except
def post_dates(permission, dates):
    a=1


@try_except
def post_responsibles(reclamation, responsibles):
    a=1