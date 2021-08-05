from datetime import datetime
from django.db.models import Sum
from plxk.api.try_except import try_except
from ..models import Stationery_type, Stationery_order
from accounts.models import Department


@try_except
def get_stationery_orders(request, month, year, department_ordered=True):
    date_filter = datetime(int(year), int(month), 1)
    orders = Stationery_order.objects\
        .filter(month=date_filter)\
        .filter(is_active=True)

    if department_ordered:
        orders = orders.filter(department=request.user.userprofile.department)

    orders = [{
        'id': order.id,
        'name': order.stationery_type.name,
        'stationery_type_id': order.stationery_type.id,
        'quantity': order.quantity,
        'measurement': order.stationery_type.measurement,
        'department': order.department.id,
        'department_name': order.department.name
    } for order in orders]
    return orders


@try_except
def get_stationery_types_list(only_active=True, name_with_measurement=False):
    stationery_types = Stationery_type.objects.order_by('name')

    if not only_active:
        stationery_types = stationery_types.filter(is_active=True)

    stationery_types = [{
        'id': stationery_type.pk,
        'name': stationery_type.name + ' (од. виміру: ' + stationery_type.measurement + ')'
            if name_with_measurement else stationery_type.name,
        'measurement': stationery_type.measurement
    } for stationery_type in stationery_types]

    return stationery_types


@try_except
def get_summary_table(month, year):
    stationery_types = get_stationery_types_list(False, True)
    date_filter = datetime(int(year), int(month), 1)

    column_widths = [{'columnName': 'department', 'width': 250}]
    header = get_header(stationery_types, date_filter)
    rows = get_rows(date_filter, header)

    return {'header': header, 'rows': rows, 'widths': column_widths}


@try_except
def get_header(stationery_types, date_filter):
    header = [{'name': 'department', 'title': 'Відділ'}]
    for st in stationery_types:
        if Stationery_order.objects.filter(month=date_filter).filter(is_active=True).filter(stationery_type_id=st['id']).exists():
            header.append({'name': st['id'], 'title': st['name'] + ' (' + st['measurement'] + ')'})
    return header


@try_except
def get_rows(date_filter, header):
    summary_table = [{
        'id': department.id,
        'department': department.name
    } for department in Department.objects.filter(is_active=True)]

    orders_list = Stationery_order.objects.filter(month=date_filter).filter(is_active=True)

    orders = [{
        'dep_id': order.department_id,
        'stationery': order.stationery_type_id,
        'quantity': order.quantity,
    } for order in orders_list]

    # Переносимо дані з замовлень у зведену таблицю
    should_restart = True
    while should_restart:
        should_restart = False
        for row in summary_table:
            for idx, order in enumerate(orders):
                if order['dep_id'] == row['id']:
                    row[order['stationery']] = order['quantity']
                    orders.pop(idx)
                    should_restart = True
                    break

    # Очищаємо список від відділів, які нічого не замовили
    should_restart = True
    while should_restart:
        should_restart = False
        for idx, row in enumerate(summary_table):
            if len(row) == 2:
                summary_table.pop(idx)
                should_restart = True
                break

    # Створюємо сумарний рядок
    footer = {'id': 0, 'department': 'Всього'}
    for item in header:
        if item['name'] == 'department':
            continue
        total = orders_list.filter(stationery_type_id=item['name']).aggregate(Sum('quantity'))
        footer[item['name']] = total['quantity__sum']

    summary_table.append(footer)

    return summary_table
