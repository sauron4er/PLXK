from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.db import transaction
from datetime import datetime
from django.utils.timezone import get_current_timezone
import json
from edms.models import Employee_Seat
from plxk.api.try_except import try_except
from plxk.api.datetime_normalizers import date_to_json
from plxk.api.convert_to_local_time import convert_to_localtime
from plxk.api.global_getters import get_dep_chief, get_director_userprofile, get_quality_director
from plxk.api.pagination import sort_query_set, filter_query_set
from .models import Reclamation, Reclamation_file, Reclamation_decision, Reclamation_comment, Reclamation_comment_file
from .api.reclamation_mail_sender import create_and_send_mail


@login_required(login_url='login')
@try_except
def reclamations(request):
    return render(request, 'boards/reclamations/index.html')


@try_except
def get_reclamations(request, counterparty, page):
    reclamations_query = Reclamation.objects.filter(is_active=True)

    if counterparty != '0':
        # При отриманні списку на сторінці контрагента фільтруємо по контрагенту
        reclamations_query = reclamations_query.filter(client_id=counterparty)

    reclamations_query = filter_query_set(reclamations_query, json.loads(request.POST['filtering']))
    reclamations_query = sort_query_set(reclamations_query, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(reclamations_query, 23)
    try:
        ncs_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        ncs_page = paginator.page(1)
    except EmptyPage:
        ncs_page = paginator.page(1)

    reclamations_list = [{
        'id': reclamation.pk,
        'client': reclamation.client.name,
        'product': reclamation.product.name,
        'car_number': reclamation.car_number,
        'author': reclamation.author.pip,
        'responsible': reclamation.responsible.pip if reclamation.responsible else '',
        'status': 'ok' if reclamation.phase == 4 else '' if reclamation.phase == 666 else 'in progress'
    } for reclamation in ncs_page.object_list]

    response = {'rows': reclamations_list, 'pagesCount': paginator.num_pages}
    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@try_except
def get_reclamation(request, pk):
    reclamation = Reclamation.objects.get(pk=pk)

    reclamation_fields = {
        'id': reclamation.id,
        'phase': reclamation.phase,
        'author_name': reclamation.author.pip,
        'date_added': date_to_json(reclamation.date_db_added),
        'department_name': reclamation.department.name,
        'dep_chief': reclamation.dep_chief_id,
        'dep_chief_name': reclamation.dep_chief.pip,
        'dep_chief_approved': reclamation.dep_chief_approved or '',
        'product_type': reclamation.product.type.id,
        'product_type_name': reclamation.product.type.name,
        'product': reclamation.product.id,
        'product_name': reclamation.product.name,
        'client': reclamation.client.id,
        'client_name': reclamation.client.name,
        'reason': reclamation.reason,
        'car_number': reclamation.car_number,
        'date_manufacture': date_to_json(reclamation.date_manufacture),
        'date_shipment': date_to_json(reclamation.date_shipment),
        'date_received': date_to_json(reclamation.date_received),

        'old_files': [{
            'id': file.id,
            'file': file.file.name,
            'name': file.name,
        } for file in Reclamation_file.objects.filter(reclamation_id=reclamation.id).filter(is_active=True)],

        'decisions': [{
            'id': decision.id,
            'user': decision.user_id,
            'user_name': decision.user.pip,
            'decision': decision.decision or '',
            'decision_time': convert_to_localtime(decision.decision_time, 'time') if decision.decision_time else '',
            'phase': decision.phase
        } for decision in Reclamation_decision.objects.filter(reclamation=reclamation).filter(is_active=True)],

        'final_decisioner': get_director_userprofile(),
        'final_decision': reclamation.final_decision or '',
        'final_decision_time': convert_to_localtime(reclamation.final_decision_time, 'day') if reclamation.final_decision_time else '',
        'responsible': reclamation.responsible.id if reclamation.responsible else 0,
        'responsible_name': reclamation.responsible.pip if reclamation.responsible else '',
        'answer_responsible_dep': reclamation.answer_responsible_dep.id if reclamation.answer_responsible_dep else '',
        'answer_responsible_dep_name': reclamation.answer_responsible_dep.name if reclamation.answer_responsible_dep else '',
        'quality_director_name': get_quality_director('name'),

        'comments': get_comments(pk)
    }

    user_role = 'viewer'
    if reclamation.responsible and reclamation.responsible_id == request.user.userprofile.id:
        user_role = 'responsible'
    elif get_dep_chief(reclamation.author) == request.user.userprofile:
        user_role = 'dep_chief'
    elif reclamation.author.user == request.user:
        user_role = 'author'
    elif get_director_userprofile('id') == request.user.userprofile.id:
        user_role = 'director'

    return HttpResponse(json.dumps({'reclamation': reclamation_fields, 'user_role': user_role}))


@transaction.atomic
@login_required(login_url='login')
@try_except
def post_reclamation(request):
    data = json.loads(request.POST.copy()['reclamation'])

    if data['id'] == 0:
        reclamation = Reclamation(author=request.user.userprofile)
    else:
        reclamation = Reclamation.objects.get(pk=data['id'])

    if data['phase'] < 2:
        # Вносимо початкові дані або зміни, внесені автором/керівником автора перед поданням на візування
        reclamation.department = request.user.userprofile.department
        reclamation.dep_chief_id = data['dep_chief'] if data['dep_chief'] != 0 else get_dep_chief(request.user.userprofile, 'id')
        reclamation.dep_chief_approved = None if data['dep_chief_approved'] == '' else data['dep_chief_approved']
        reclamation.product_id = data['product']
        reclamation.client_id = data['client']
        reclamation.reason = data['reason']
        reclamation.car_number = data['car_number']
        reclamation.date_manufacture = data['date_manufacture']
        reclamation.date_shipment = data['date_shipment']
        reclamation.date_received = data['date_received']
        reclamation.responsible = data['responsible']
        reclamation.answer_responsible_dep = data['answer_responsible_dep']

        if data['dep_chief_approved'] == '' or data['dep_chief_approved'] is None:
            reclamation.phase = 1
        elif data['dep_chief_approved'] is True:
            reclamation.phase = 2
        else:
            reclamation.phase = 666  # Скасовано

        reclamation.save()

        post_files(reclamation, request.FILES, data['old_files'])

        if data['phase'] == 0:
            create_and_send_mail('dep_chief', reclamation.dep_chief_id, reclamation.id)

    return HttpResponse('provider.pk')


@transaction.atomic
@login_required(login_url='login')
@try_except
def dep_chief_approval(request):
    reclamation = Reclamation.objects.get(id=request.POST['reclamation_id'])
    reclamation.dep_chief_approved = json.loads(request.POST['approved'])

    if reclamation.dep_chief_approved is False:
        reclamation.phase = 666
    else:
        reclamation.phase = 2
        reclamation.save()

        director_id = get_director_userprofile('id')
        new_decision = Reclamation_decision(reclamation=reclamation, user_id=director_id, phase=2)
        new_decision.save()

        decisions = json.loads(request.POST['decisions'])
        for decision in decisions:
            user_id = Employee_Seat.objects.values_list('employee_id', flat=True).filter(id=decision['id'])[0]
            if user_id != director_id:
                new_decision = Reclamation_decision(reclamation=reclamation, user_id=user_id, phase=1)
                new_decision.save()
                create_and_send_mail('decisioner', user_id, reclamation.id)

        create_and_send_mail('author', reclamation.author_id, reclamation.id)

    return HttpResponse('ok')


@try_except
def post_files(reclamation, new_files, old_files):
    for file in new_files.getlist('new_files'):
        Reclamation_file.objects.create(
            reclamation=reclamation,
            file=file,
            name=file.name
        )


@try_except
def post_decision(request):
    decision = json.loads(request.POST['decision'])
    decision_instance = get_object_or_404(Reclamation_decision, pk=decision['id'])
    decision_instance.decision = decision['decision']
    decision_instance.decision_time = datetime.now(tz=get_current_timezone())
    decision_instance.save()

    if decision_instance.phase == 1:
        phase_one_is_done = not Reclamation_decision.objects\
            .filter(reclamation_id=request.POST['reclamation_id'])\
            .filter(phase=1)\
            .filter(decision__isnull=True)\
            .filter(is_active=True)\
            .exists()

        if phase_one_is_done:
            director_decided = Reclamation_decision.objects.values_list('decision', flat=True)\
                .filter(reclamation_id=request.POST['reclamation_id'])\
                .filter(phase=2)\
                .filter(is_active=True)
            if not director_decided:
                create_and_send_mail('decisioner', get_director_userprofile('id'), decision_instance.reclamation_id)

    else:  # phase = 2 - рішення директора
        reclamation_instance = Reclamation.objects.get(pk=request.POST['reclamation_id'])
        reclamation_instance.final_decision = decision['decision']
        reclamation_instance.final_decision_time = datetime.now(tz=get_current_timezone())
        reclamation_instance.responsible_id = request.POST['responsible']
        reclamation_instance.phase = 3
        reclamation_instance.save()

    create_and_send_mail('author', decision_instance.reclamation.author_id, decision_instance.reclamation_id)
    create_and_send_mail('responsible', decision_instance.reclamation.responsible_id, decision_instance.reclamation_id)

    return HttpResponse(json.dumps(convert_to_localtime(decision_instance.decision_time, 'time')))


@try_except
def get_comments(reclamation_id):
    comments = [{
        'id': comment.id,
        'author': comment.author.pip,
        'text': comment.comment,
        'original_comment_id': comment.original_comment.id if comment.original_comment else 0,
        'original_comment_text': comment.original_comment.comment if comment.original_comment else '',
        'original_comment_author': comment.original_comment.author.pip if comment.original_comment else '',
        'files': [{
            'id': file.id,
            'file': file.file.name,
            'name': file.name,
        } for file in Reclamation_comment_file.objects.filter(comment_id=comment.id).filter(is_active=True)]
    } for comment in Reclamation_comment.objects
        .filter(reclamation=reclamation_id)
        .filter(is_active=True).order_by('-id')]
    return comments


@transaction.atomic
@login_required(login_url='login')
@try_except
def post_new_comment(request):
    comment = Reclamation_comment(author=request.user.userprofile)
    comment.reclamation_id = request.POST['reclamation_id']
    comment.comment = request.POST['comment']

    if request.POST['original_comment_id'] != '':
        comment.original_comment_id = request.POST['original_comment_id']

    comment.save()

    post_comment_files(comment, request.FILES)

    if comment.original_comment:
        create_and_send_mail('answer', comment.original_comment.author_id, comment.reclamation_id)

    create_and_send_mail('author', comment.reclamation.author_id, comment.reclamation_id)

    return HttpResponse(json.dumps(get_comments(request.POST['reclamation_id'])))


@try_except
def post_comment_files(comment_instance, files):
    for file in files.getlist('new_comment_files'):
        Reclamation_comment_file.objects.create(
            comment=comment_instance,
            file=file,
            name=file.name
        )


# @transaction.atomic
# @login_required(login_url='login')
# @try_except
# def done(request):
#     data = json.loads(request.POST.copy()['reclamation'])
#     nc = get_object_or_404(Reclamation, pk=data['id'])
#
#     nc.corrective_action = data['corrective_action']
#     if data['corrective_action_number'] != '':
#         nc.corrective_action_number = data['corrective_action_number']
#
#     if data['final_decision'] == 'Переробка':
#         nc.retreatment_date = data['retreatment_date']
#         nc.spent_time = data['spent_time']
#         nc.people_involved = data['people_involved']
#         nc.quantity_updated = data['quantity_updated']
#         nc.status_updated = data['status_updated']
#     if data['final_decision'] == 'Повернення постачальнику':
#         nc.return_date = data['return_date']
#
#     nc.phase = 4
#     nc.save()
#
#     create_and_send_mail('author', nc.author_id, nc.id)
#     return HttpResponse('ok')
