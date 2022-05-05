import json
from django.shortcuts import get_object_or_404
from plxk.api.try_except import try_except
from plxk.api.datetime_normalizers import date_to_json
from plxk.api.files_query_to_list_converter import files_query_to_list
from edms.api.getters import get_dep_chief
from hr.models import Department_Regulation, Regulation_file
from accounts.models import Department


@try_except
def get_dep_list_for_regulations():
    departments = [{
        'id': department.pk,
        'name': department.name,
    } for department in Department.objects.only('id', 'name')\
        .filter(is_active=True)\
        .filter(regulations__isnull=True)\
        .order_by('name')]

    return departments


@try_except
def get_regulations_list():
    regulations_list = Department_Regulation.objects.filter(is_active=True)
    regulations_list = [{
        'id': regulation.id,
        'department': regulation.department.name,
        'files': files_query_to_list(Regulation_file.objects.filter(regulation=regulation.id).filter(is_active=True))
    } for regulation in regulations_list]
    return regulations_list


@try_except
def post_regulation(request):
    regulation = Department_Regulation(name=request.POST['name'],
                                       number=request.POST['number'],
                                       version=request.POST['version'],
                                       department_id=request.POST['department'],
                                       date_start=request.POST['date_start'])
    if request.POST['staff_units'] != '':
        regulation.staff_units = request.POST['staff_units']
    if request.POST['date_revision'] != '':
        regulation.date_revision = request.POST['date_revision']
    regulation.save()

    return regulation.pk


@try_except
def get_regulation_api(pk):
    regulation = get_object_or_404(Department_Regulation, pk=pk)
    reg = {'name': regulation.name}
    reg.update({'number': regulation.number})
    reg.update({'version': regulation.version})
    reg.update({'staff_units': regulation.staff_units or ''})
    reg.update({'department': regulation.department_id})
    reg.update({'department_name': regulation.department.name})

    dep_chief = get_dep_chief(regulation.department_id)
    reg.update({'dep_chief_seat': dep_chief['id']})
    reg.update({'dep_chief_seat_name': dep_chief['name']})

    reg.update({'date_start': date_to_json(regulation.date_start)})
    reg.update({'date_revision': date_to_json(regulation.date_revision) or ''})

    old_files = get_regulation_files(regulation.id)
    reg.update({'old_files': old_files})

    return reg


@try_except
def change_regulation(request, pk):
    regulation = get_object_or_404(Department_Regulation, pk=pk)

    regulation.name = request.POST['name']
    regulation.number = request.POST['number']
    regulation.version = request.POST['version']
    regulation.department_id = request.POST['department']
    regulation.date_start = request.POST['date_start']

    if request.POST['staff_units'] != '':
        regulation.staff_units = request.POST['staff_units']
    if request.POST['date_revision'] != '':
        regulation.date_revision = request.POST['date_revision']
    else:
        regulation.date_revision = None

    regulation.save()
    return regulation.pk


@try_except
def deact_regulation_api(pk):
    regulation = get_object_or_404(Department_Regulation, pk=pk)
    regulation.is_active = False
    regulation.save()


@try_except
def post_regulation_file(files, request_post):
    new_files = files.getlist('new_files')
    old_files = json.loads(request_post['old_files']) if 'old_files' in request_post else []

    for file in new_files:
        Regulation_file.objects.create(
            regulation_id=request_post['id'],
            file=file,
            name=u'' + file.name
        )

    for file in old_files:
        if file['status'] == 'delete':
            deactivate_regulation_file(request_post, file)


@try_except
def deactivate_regulation_file(post_request, file):
    file = get_object_or_404(Regulation_file, pk=file['id'])
    file.is_active = False
    file.save()


@try_except
def get_dep_regulation_files(dep_id):
    regulation = Department_Regulation.objects.filter(department_id=dep_id).filter(is_active=True).first()
    if regulation:
        regulation_files = get_regulation_files(regulation.id)
        return regulation_files
    return []


@try_except
def get_regulation_files(regulation_id):
    files = files_query_to_list(Regulation_file.objects.filter(regulation_id=regulation_id).filter(is_active=True))
    return files
