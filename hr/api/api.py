from plxk.api.try_except import try_except
from hr.models import Department_Regulation, Regulation_file, Seat_Instruction, Instruction_file


@try_except
def get_regulations_list():
    regulations_list = [{'id': 1, 'department': 'IT', 'file': ''}]
    return regulations_list


@try_except
def get_instructions_list():
    instructions_list = [{'id': 1, 'department': 'IT', 'seat': 'Системний адмін', 'file': ''}]
    return instructions_list


@try_except
def post_regulation(request):
    a=1


@try_except
def change_regulation(request, pk):
    a=1


@try_except
def post_instruction(request):
    a=1


@try_except
def change_instruction(request, pk):
    a=1
