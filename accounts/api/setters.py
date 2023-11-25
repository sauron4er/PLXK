from django.shortcuts import get_object_or_404
from ..models import Department


def dep_name_change_api(id, new_name):
    department = get_object_or_404(Department, id=id)
    department.name = new_name
    department.save()
