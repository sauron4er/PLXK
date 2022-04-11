import json
from django.shortcuts import get_object_or_404
from plxk.api.try_except import try_except
from hr.models import Department_Regulation, Regulation_file, Seat_Instruction, Instruction_file


@try_except
def get_regulations_list():
    regulations_list = Department_Regulation.objects.filter(is_active=True)
    regulations_list = [{
        'id': regulation.id,
        'department': regulation.department.name,
        'files': [{
            'id': file.id,
            'file': u'' + file.file.name,
            'name': u'' + file.name
        } for file in Regulation_file.objects
            .filter(regulation=regulation.id)
            .filter(is_active=True)]
    } for regulation in regulations_list]
    return regulations_list


@try_except
def post_regulation(request):
    regulation = Department_Regulation(name=request.POST['name'],
                                       number=request.POST['number'],
                                       version=request.POST['version'],
                                       staff_units=request.POST['staff_units'],
                                       department_id=request.POST['department'],
                                       date_start=request.POST['date_start'])
    if request.POST['date_revision'] != '':
        regulation.date_revision = request.POST['date_revision']

    regulation.save()

    return regulation.pk


@try_except
def get_regulation(request):
    a=1


@try_except
def change_regulation(request, pk):
    regulation = Department_Regulation.objects.filter(pk=pk)
    reg = regulation


@try_except
def post_regulation_file(files, request_post):
    new_files = files.getlist('new_files')
    old_files = json.loads(request_post['old_files']) if 'old_files' in request_post else []

    # regulation = get_object_or_404(Department_Regulation, pk=request_post['id'])

    for file in new_files:
        Regulation_file.objects.create(
            # regulation=regulation,
            regulation_id=request_post['id'],
            file=file,
            name=u'' + file.name
        )

    for file in old_files:
        if file['status'] == 'delete':
            deactivate_regulation_file(request_post, file)


@try_except
def deactivate_regulation_file(post_request, file):
    post_request.update({'is_active': False})
    file = get_object_or_404(Regulation_file, pk=file['id'])
    file.is_active = False
    file.save()
