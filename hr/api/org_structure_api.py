import json
from django.shortcuts import get_object_or_404
from plxk.api.try_except import try_except
from edms.models import Seat, Employee_Seat
from accounts.models import Department


@try_except
def get_org_structure(tdv=True):
    direction = Department.objects.values('id', 'name')\
        .filter(id=45)\
        .first()

    direction.update({
        # 'chief': unpack_dep_chief(direction['id']),
        'seats': get_seats(direction['id'])
    })

    departments = [{
        'id': dep.id,
        'name': dep.name
    } for dep in Department.objects
        .exclude(id=45)
        .filter(is_tdv=tdv)
        .filter(is_active=True)
        .order_by('name')]

    for dep in departments:
        dep.update({
            # 'chief': unpack_dep_chief(dep['id']),
            'seats': get_seats(dep['id'])
        })

    departments.insert(0, direction)

    return departments


@try_except
def get_chief(dep_id):
    chief = Seat.objects.values('id', 'seat')\
        .filter(department_id=dep_id)\
        .filter(is_dep_chief=True)\
        .filter(is_active=True)\
        .first()

    if chief:
        return {
            'id': chief['id'],
            'name': chief['seat'],
            'is_chief': True
        }
    else:
        return {
            'id': 0,
            'name': 'Посаду начальника відділу не визначено',
            'is_chief': True
        }


@try_except
def get_seats(dep_id):
    chief = get_chief(dep_id)

    seats_query = Seat.objects\
        .filter(department_id=dep_id) \
        .filter(is_dep_chief=False) \
        .filter(is_active=True) \
        .order_by('seat')
    seats = [{
        'id': seat.id,
        'name': seat.seat,
        'is_chief': False
    } for seat in seats_query]

    seats = [chief] + seats

    return seats
