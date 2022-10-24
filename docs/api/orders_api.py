from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.db.models import Q
import datetime
from plxk.api.try_except import try_except
from plxk.api.datetime_normalizers import date_to_json
from plxk.api.global_getters import get_users_emp_seat_ids
from docs.models import Order_doc, File, Order_article, Article_responsible, Responsible_file
from docs.forms import NewDocOrderForm, CancelOrderForm, DeactivateOrderForm, OrderDoneForm


def get_order_info(order, employee_id):
    order = {
        'id': order.id,
        'code': order.code,
        'type': order.doc_type_id,
        'type_name': order.doc_type.name,
        'name': order.name,
        'author': order.author_id,
        'author_name': order.author.last_name + ' ' + order.author.first_name,
        'canceled_by_id': order.canceled_by_id,
        'canceled_by_code': get_order_code(order.canceled_by.id) if order.canceled_by_id else '',
        'cancels_other_doc': order.cancels_id is not None and order.cancels_code != '',
        'cancels_id': order.cancels_id if order.cancels_id else '',
        'cancels_code': order.cancels_code if order.cancels_code else get_order_code(order.cancels_id),
        'date_start': date_to_json(order.date_start) if order.date_start else '',
        'date_canceled': date_to_json(order.date_canceled) if order.date_canceled else '',
        'responsible': order.responsible_id if order.responsible else 0,
        'responsible_name': order.responsible.last_name + ' ' + order.responsible.first_name if order.responsible else '',
        'supervisory': order.supervisory_id,
        'supervisory_name': order.supervisory.last_name + ' ' + order.supervisory.first_name,
        'done': order.done,
        'edms_doc_id': order.edms_doc.id if order.edms_doc else 0
    }

    articles_raw = Order_article.objects.filter(order_id=order['id']).filter(is_active=True)
    filtered_articles = articles_raw.exclude((Q(periodicity='m') | Q(periodicity='y')), Q(done=True))
    # TODO треба додати перевірку на те, чи не закінчилася дія Договору, в такому разі треба останній article показувати

    articles = [{
        'id': article.id,
        'text': article.text,
        'term': article.term,
        'constant': 'true' if article.deadline is None else 'false',
        'deadline': date_to_json(article.deadline) if article.deadline else '',
        'status': 'old',
        'periodicity': article.periodicity if article.periodicity else '',
        'done': article.done,
        'responsibles': [{
            'responsible_id': responsible.id,
            'id': responsible.employee_seat.id,
            'emp_seat': responsible.employee_seat.employee.pip + ', ' + responsible.employee_seat.seat.seat,
            'done': responsible.done,
            'comment': responsible.comment if responsible.comment else '',
            'files_old': [{
                'id': file.id,
                'name': file.name,
                'file': file.file.name,
                'status': 'old'
            } for file in Responsible_file.objects.filter(responsible_id=responsible.id).filter(is_active=True)],
            'user_is_responsible': responsible.employee_seat.id in get_users_emp_seat_ids(employee_id),
            'status': 'old',
        } for responsible in Article_responsible.objects.filter(article_id=article.id).filter(is_active=True)]
    } for article in filtered_articles]

    files = File.objects.filter(is_active=True).filter(order__id=order['id'])

    files_old = [{
        'id': file.id,
        'name': file.name,
        'file': file.file.name,
        'is_added_or_canceled': file.is_added_or_canceled,
        'status': 'old'
    } for file in files.filter(is_added_or_canceled=True)]

    # TODO написати створення нових пунктів по щомісячних та щорічних повторах

    cancels_files_old = [{
        'id': file.id,
        'name': file.name,
        'file': file.file.name,
        'is_added_or_canceled': file.is_added_or_canceled,
        'status': 'old'
    } for file in files.filter(is_added_or_canceled=False)]

    order.update({
        'files_old': files_old,
        'cancels_files_old': cancels_files_old,
        'articles': articles,
        # Відсилаємо пусті поля, які повинні бути в orderStore (без відсилання вони не створюються)
        'cancels_files': [],
        'files': [],
        'mail_list': []
    })

    return order


@try_except
def post_order(post_request):
    order_form = NewDocOrderForm(post_request)
    if order_form.is_valid():
        order = order_form.save()
        return order
    else:
        raise ValidationError('docs/orders_api/post_order: order_form invalid')


@try_except
def change_order(post_request):
    order = get_object_or_404(Order_doc, pk=post_request['id'])
    order_form = NewDocOrderForm(post_request, instance=order, initial={'date_canceled': None, 'canceled_by': None, 'cancels': None})
    if order_form.is_valid():
        order_form.save()
    else:
        raise ValidationError('docs/orders: function change_order: order_form invalid')


@try_except
def deactivate_order(request):
    post_request = request.POST.copy()
    post_request.update({'updated_by': request.user.id})
    post_request.update({'updated_at': datetime.datetime.now()})

    order = get_object_or_404(Order_doc, pk=post_request['id'])
    order_form = DeactivateOrderForm(post_request, instance=order)
    if order_form.is_valid():
        order_form.save()
    else:
        raise ValidationError('docs/orders/deactivate_order: order_form invalid')


@try_except
def post_order_done(post_request):
    done = not Order_article.objects.filter(order_id=post_request['id']).filter(done=False).filter(is_active=True).exists()
    order = get_object_or_404(Order_doc, pk=post_request['id'])

    if done != order.done:
        post_request.update({'done': done})
        order_done_form = OrderDoneForm(post_request, instance=order)
        if order_done_form.is_valid():
            order_done_form.save()
        else:
            raise ValidationError('docs/orders/post_order_done: order_done_form invalid')
    return done


@try_except
def post_files(files, post_request):
    added_files = files.getlist('files')
    cancelled_files = files.getlist('cancels_files')
    order = get_object_or_404(Order_doc, pk=post_request['id'])

    for file in added_files:
        File.objects.create(
            order=order,
            file=file,
            name=file.name,
            is_added_or_canceled=True
        )

    for file in cancelled_files:
        File.objects.create(
            order=order,
            file=file,
            name=file.name,
            is_added_or_canceled=False
        )


@try_except
def deactivate_files(files):
    for file in files:
        if file['status'] == 'delete':
            File.objects.filter(id=file['id']).update(is_active=False)


@try_except
def cancel_order(post_request, instance):
    cancel_order_form = CancelOrderForm(post_request, instance=instance)
    if cancel_order_form.is_valid():
        cancel_order_form.save()
    else:
        raise ValidationError('docs/orders: function post_document: document_form invalid')


@try_except
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


@try_except
def get_order_code(order):
    if order:
        order_info = list(Order_doc.objects.values('doc_type__name', 'code').filter(id=order))[0]
        type = 'R' if order_info['doc_type__name'] == 'Розпорядження' else 'N' if order_info['doc_type__name'] == 'Наказ' else 'P'
        return type + order_info['code']
    else:
        return ''


@try_except
def get_order_code_for_table(order, type_name, code):
    if order:
        type_letter = 'R' if type_name == 'Розпорядження' else 'N' if type_name == 'Наказ' else 'P'
        return type_letter + code
    else:
        return ''
