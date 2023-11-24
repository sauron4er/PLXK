import json
from django.shortcuts import get_object_or_404
from edms.api.getters import get_dep_chief
from plxk.api.try_except import try_except
from plxk.api.datetime_normalizers import date_to_json
from hr.models import Instruction, Instruction_file
from edms.models import Seat
from plxk.api.files_query_to_list_converter import files_query_to_list


@try_except
def get_dep_seat_list_for_instruction(dep_id):
    seats = [{
        'id': seat.pk,
        'name': seat.seat,
        'chief_seat_name': seat.chief.seat if seat.chief else 'Посаду начальника не внесено в базу'
    } for seat in Seat.objects
        .filter(department_id=dep_id)
        .filter(instructions__isnull=True)
        .filter(is_active=True)
        .order_by('seat')]

    return seats


@try_except
def get_instructions_list():
    instructions_list = Instruction.objects.filter(is_active=True)
    instructions_list = [{
        'id': instruction.id,
        'department': instruction.department.name if instruction.department else instruction.seat.department.name,
        'seat': instruction.seat.seat if instruction.seat else '',
        'files': [{
            'id': file.id,
            'file': file.file.name,
            'name': file.name
        } for file in Instruction_file.objects
            .filter(instruction=instruction.id)
            .filter(is_active=True)]
    } for instruction in instructions_list]
    return instructions_list


@try_except
def get_instruction_api(pk):
    instruction = get_object_or_404(Instruction, pk=pk)
    instr = {'name': instruction.name}
    instr.update({'type': 'seat' if instruction.seat else 'work'})
    instr.update({'number': instruction.number})
    instr.update({'version': instruction.version})
    instr.update({'staff_units': instruction.staff_units or ''})
    instr.update({'department': instruction.department_id if instruction.department else instruction.seat.department_id})
    instr.update({'department_name': instruction.department.name if instruction.department else instruction.seat.department.name})
    instr.update({'seat': instruction.seat_id or 0})
    instr.update({'seat_name': instruction.seat.seat if instruction.seat else ''})
    instr.update({'chief_seat_name': instruction.seat.chief.seat if instruction.seat else ''})

    dep_chief = get_dep_chief(instruction.department_id or instruction.seat.department_id)
    instr.update({'dep_chief_seat': dep_chief['id']})
    instr.update({'dep_chief_seat_name': dep_chief['name']})

    instr.update({'date_start': date_to_json(instruction.date_start)})
    instr.update({'date_revision': date_to_json(instruction.date_revision) or ''})

    # old_files = files_query_to_list(Instruction_file.objects.filter(instruction=instruction).filter(is_active=True))
    old_files = get_instruction_files(instruction.id)
    instr.update({'old_files': old_files})

    return instr


@try_except
def get_seat_instruction_files(seat_id):
    instruction = Instruction.objects.filter(seat_id=seat_id).filter(is_active=True).first()
    if instruction:
        instruction_files = get_instruction_files(instruction.id)
        return instruction_files
    return []


@try_except
def get_instruction_files(instruction_id):
    files = files_query_to_list(Instruction_file.objects.filter(instruction_id=instruction_id).filter(is_active=True))
    return files


@try_except
def deact_instruction_api(pk):
    instruction = get_object_or_404(Instruction, pk=pk)
    instruction.is_active = False
    instruction.save()


@try_except
def post_instruction(request):
    instruction = Instruction(name=request.POST['name'],
                              number=request.POST['number'],
                              version=request.POST['version'],
                              date_start=request.POST['date_start'])
    if 'department' in request.POST:
        instruction.department_id = request.POST['department']
    else:
        instruction.seat_id = request.POST['seat']
    if request.POST['staff_units'] != '':
        instruction.staff_units = request.POST['staff_units']
    if request.POST['date_revision'] != '':
        instruction.date_revision = request.POST['date_revision']
    instruction.save()
    return instruction.pk


@try_except
def change_instruction(request, pk):
    instruction = get_object_or_404(Instruction, pk=pk)

    instruction.name = request.POST['name']
    instruction.number = request.POST['number']
    instruction.version = request.POST['version']
    if 'department' in request.POST:
        instruction.seat = None
        instruction.department_id = request.POST['department']
    else:
        instruction.department = None
        instruction.seat_id = request.POST['seat']

    instruction.date_start = request.POST['date_start']

    if request.POST['staff_units'] != '':
        instruction.staff_units = request.POST['staff_units']
    if request.POST['date_revision'] != '':
        instruction.date_revision = request.POST['date_revision']
    else:
        instruction.date_revision = None

    instruction.save()
    return instruction.pk


@try_except
def post_instruction_file(files, request_post):
    new_files = files.getlist('new_files')
    old_files = json.loads(request_post['old_files']) if 'old_files' in request_post else []

    for file in new_files:
        Instruction_file.objects.create(
            instruction_id=request_post['id'],
            file=file,
            name=u'' + file.name
        )

    for file in old_files:
        if file['status'] == 'delete':
            deactivate_instruction_file(request_post, file)


@try_except
def deactivate_instruction_file(post_request, file):
    file = get_object_or_404(Instruction_file, pk=file['id'])
    file.is_active = False
    file.save()
