from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.db import transaction
from datetime import datetime
from django.utils.timezone import get_current_timezone
import json
from plxk.api.try_except import try_except
from plxk.api.datetime_normalizers import date_to_json
from plxk.api.convert_to_local_time import convert_to_localtime
from plxk.api.pagination import sort_query_set, filter_query_set
from .models import Permission, Permission_Responsible



@login_required(login_url='login')
@try_except
def permissions(request):
    return render(request, 'boards/permissions/permissions.html')


@login_required(login_url='login')
@try_except
def get_permissions(request, page):
    permissions_query = Permission.objects.filter(is_active=True).order_by('date_next')

    permissions_query = filter_query_set(permissions_query, json.loads(request.POST['filtering']))
    if request.POST['sort_name']:
        permissions_query = sort_query_set(permissions_query, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(permissions_query, 23)
    try:
        permissions_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        permissions_page = paginator.page(1)
    except EmptyPage:
        permissions_page = paginator.page(1)

    permissions_list = [{
        'id': permission.pk,
        'category': permission.category.name,
        'department': permission.department.name,
        'name': permission.name,
        'date_next': convert_to_localtime(permission.date_next, 'day')
    } for permission in permissions_page.object_list]

    response = {'rows': permissions_list, 'pagesCount': paginator.num_pages}
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
def add_permission(request):
    data = json.loads(request.POST.copy()['permission'])

    if data['id'] == 0:
        permission = Permission(author=request.user.userprofile)
    else:
        permission = Permission.objects.get(pk=data['id'])

    permission.author = request.user.userprofile
    permission.category_id = data['category']
    permission.department_id = data['department']
    permission.name = data['name']
    permission.info = data['info']
    permission.comment = data['comment']
    permission.date_next = data['date_next']
    permission.save()

    if data['responsibles']:
        post_responsibles(permission, data['responsibles'])

    # post_files(permission, request.FILES, data['old_files'])

    return HttpResponse(permission.id)


# @try_except
# def post_files(permission, new_files, old_files):
#     for file in new_files.getlist('new_files'):
#         Permission_File.objects.create(
#             permission=permission,
#             file=file,
#             name=file.name
#         )

@try_except
def post_responsibles(permission, responsibles):
    for resp in responsibles:
        if resp['status'] == 'new':
            new_responsible = Permission_Responsible(permission=permission)
            new_responsible.employee_id = resp['id']
            new_responsible.save()
        elif resp['status'] == 'delete':
            resp_instance = get_object_or_404(Permission_Responsible, id=resp['responsible_id'])
            resp_instance.is_active = False
            resp_instance.save()
