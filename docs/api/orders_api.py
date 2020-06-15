from docs.forms import NewDocOrderForm, CancelOrderForm, DeactivateOrderForm
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from docs.models import Order_doc, File


def post_order(post_request):
    try:
        order_form = NewDocOrderForm(post_request)
        if order_form.is_valid():
            order = order_form.save()
            return order
        else:
            raise ValidationError('docs/orders: function post_order: order_form invalid')
    except Exception as err:
        raise err


def change_order(post_request):
    try:
        order = get_object_or_404(Order_doc, pk=post_request['id'])
        order_form = NewDocOrderForm(post_request, instance=order, initial={'date_canceled': None, 'canceled_by': None, 'cancels': None})
        if order_form.is_valid():
            order_form.save()
        else:
            raise ValidationError('docs/orders: function change_order: order_form invalid')
    except Exception as err:
        raise err


def deactivate_order(post_request):
    try:
        order = get_object_or_404(Order_doc, pk=post_request['id'])
        order_form = DeactivateOrderForm(post_request, instance=order)
        if order_form.is_valid():
            order_form.save()
        else:
            raise ValidationError('docs/orders: function deactivate_order: order_form invalid')
    except Exception as err:
        raise err


def post_files(files, post_request):
    added_files = files.getlist('files')
    cancelled_files = files.getlist('cancels_files')
    order = get_object_or_404(Order_doc, pk=post_request['id'])

    for file in added_files:
        File.objects.create(
            order=order,
            file=file,
            name=file.name,
            is_added_or_cancelled=True
        )

    for file in cancelled_files:
        File.objects.create(
            order=order,
            file=file,
            name=file.name,
            is_added_or_cancelled=False
        )


def deactivate_files(files):
    for file in files:
        File.objects.filter(id=file).update(is_active=False)


def cancel_order(post_request, instance):
    try:
        cancel_order_form = CancelOrderForm(post_request, instance=instance)
        if cancel_order_form.is_valid():
            cancel_order_form.save()
        else:
            raise ValidationError('docs/orders: function post_document: document_form invalid')
    except Exception as err:
        raise err


def cancel_another_order(post_request):
    if post_request['cancels']:
        order = get_object_or_404(Order_doc, pk=post_request['cancels'])
        new_request = {
            'order': order,
            'canceled_by': post_request['id'],
            'date_canceled': post_request['date_start']
        }
        cancel_order(new_request, order)
    else:
        # Якщо приходить пустий cancels, шукаємо всі відмінені даним документом накази і видаляємо записи відміни.

        canceled_orders = [{
            'id': order.id
        } for order in Order_doc.objects.filter(canceled_by_id=post_request['id'])]
        for order in canceled_orders:
            order = get_object_or_404(Order_doc, pk=order['id'])
            new_request = {
                'order': order.id,
                'canceled_by': None,
                'date_canceled': None
            }
            cancel_order(new_request, order)


def get_order_code(order):
    if order:
        order_info = list(Order_doc.objects.values('doc_type__name', 'code').filter(id=order))[0]
        type = 'R' if order_info['doc_type__name'] == 'Розпорядження' else 'N' if order_info['doc_type__name'] == 'Наказ' else 'P'
        return type + order_info['code']
    else:
        return ''


def get_order_code_for_table(order, type_name, code):
    if order:
        type_letter = 'R' if type_name == 'Розпорядження' else 'N' if type_name == 'Наказ' else 'P'
        return type_letter + code
    else:
        return ''


def sort_orders(orders, column, direction):
    if column:
        if direction == 'asc':
            orders = orders.order_by(column)
        else:
            orders = orders.order_by('-' + column)
    else:
        orders = orders.order_by('-date_start', '-code')

    return orders


def filter_orders(orders, filtering):
    for filter in filtering:
        kwargs = {'{}__{}'.format(filter['columnName'], 'icontains'): filter['value']}
        orders = orders.filter(**kwargs)
    return orders
