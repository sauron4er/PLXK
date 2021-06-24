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
from plxk.api.global_getters import get_dep_chief, get_director_userprofile_id
from plxk.api.pagination import sort_query_set, filter_query_set
from .models import Non_compliance, Non_compliance_file, \
    Non_compliance_comment, Non_compliance_comment_file, Non_compliance_decision
from .api.non_compliance_mail_sender import create_and_send_mail


@login_required(login_url='login')
@try_except
def non_compliances(request):
    return render(request, 'boards/non_compliances/non_compliances.html')


@try_except
def get_non_compliances(request, page):
    ncs = Non_compliance.objects.filter(is_active=True)

    ncs = filter_query_set(ncs, json.loads(request.POST['filtering']))
    ncs = sort_query_set(ncs, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(ncs, 23)
    try:
        ncs_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        ncs_page = paginator.page(1)
    except EmptyPage:
        ncs_page = paginator.page(1)

    ncs = [{
        'id': nc.pk,
        'provider': nc.provider.name,
        'product': nc.product.name,
        'order_number': nc.order_number,
        'author': nc.author.pip,
        'responsible': nc.responsible.pip if nc.responsible else '',
        'status': 'ok' if nc.phase == 4 else '' if nc.phase == 666 else 'in progress'
    } for nc in ncs_page.object_list]

    response = {'rows': ncs, 'pagesCount': paginator.num_pages}
    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@try_except
def get_non_compliance(request, pk):
    nc_instance = get_object_or_404(Non_compliance, pk=pk)

    nc = {
        'id': nc_instance.id,
        'phase': nc_instance.phase,
        'author_name': nc_instance.author.pip,
        'date_added': date_to_json(nc_instance.date_added),
        'department_name': nc_instance.department.name,
        'dep_chief': nc_instance.dep_chief_id,
        'dep_chief_name': nc_instance.dep_chief.pip,
        'dep_chief_approved': nc_instance.dep_chief_approved or '',
        'name': nc_instance.name,
        'product': nc_instance.product.id,
        'product_name': nc_instance.product.name,
        'party_number': nc_instance.party_number,
        'order_number': nc_instance.order_number,
        'manufacture_date': date_to_json(nc_instance.manufacture_date),
        'total_quantity': nc_instance.total_quantity,
        'nc_quantity': nc_instance.nc_quantity,
        'packing_type': nc_instance.packing_type,
        'provider': nc_instance.provider.id,
        'provider_name': nc_instance.provider.name,
        'reason': nc_instance.reason,
        'status': nc_instance.status,
        'classification': nc_instance.classification,
        'defect': nc_instance.defect,
        'analysis_results': nc_instance.analysis_results,
        'sector': nc_instance.sector,
        'old_files': [{
            'id': file.id,
            'file': file.file.name,
            'name': file.name,
        } for file in Non_compliance_file.objects.filter(non_compliance_id=nc_instance.id).filter(is_active=True)],

        'decisions': [{
            'id': decision.id,
            'user': decision.user_id,
            'user_name': decision.user.pip,
            'decision': decision.decision or '---------',
            'decision_time': convert_to_localtime(decision.decision_time, 'time') if decision.decision_time else '',
            'phase': decision.phase
        } for decision in Non_compliance_decision.objects.filter(non_compliance_id=nc_instance.id).filter(is_active=True)],

        'final_decision': nc_instance.final_decision or '',
        'final_decision_time': convert_to_localtime(nc_instance.final_decision_time, 'time') if nc_instance.final_decision_time else '',
        'responsible': nc_instance.responsible.id if nc_instance.responsible else 0,
        'responsible_name': nc_instance.responsible.pip if nc_instance.responsible else '',
        'result_of_nc': nc_instance.result_of_nc or '',
        'corrective_action': nc_instance.corrective_action or '',
        'corrective_action_number': nc_instance.corrective_action_number or '',
        'other': nc_instance.other or '',
        'retreatment_date': date_to_json(nc_instance.retreatment_date) if nc_instance.retreatment_date else '',
        'spent_time': nc_instance.spent_time or '',
        'people_involved': nc_instance.people_involved or '',
        'quantity_updated': nc_instance.quantity_updated or '',
        'status_updated': nc_instance.status_updated or '',
        'return_date': nc_instance.return_date or '',

        'comments': get_comments(pk)
    }

    user_role = 'viewer'
    if nc_instance.responsible and nc_instance.responsible_id == request.user.userprofile.id:
        user_role = 'responsible'
    elif nc_instance.author.user == request.user:
        user_role = 'author'
    elif get_dep_chief(nc_instance.author) == request.user.userprofile:
        user_role = 'dep_chief'
    elif get_director_userprofile_id() == request.user.userprofile.id:
        user_role = 'director'

    return HttpResponse(json.dumps({'non_compliance': nc, 'user_role': user_role}))


@transaction.atomic
@login_required(login_url='login')
@try_except
def post_non_compliance(request):
    data = json.loads(request.POST.copy()['non_compliance'])

    if data['id'] == 0:
        nc = Non_compliance(author=request.user.userprofile)
    else:
        nc = get_object_or_404(Non_compliance, pk=data['id'])

    if data['phase'] < 2:
        # Вносимо початкові дані або зміни, внесені автором/керівником автора перед поданням на візування
        nc.department = request.user.userprofile.department
        nc.dep_chief_id = data['dep_chief'] if data['dep_chief'] != 0 else get_dep_chief(request.user.userprofile, 'id')
        nc.dep_chief_approved = None if data['dep_chief_approved'] == '' else data['dep_chief_approved']
        nc.name = data['name']
        nc.product_id = data['product']
        nc.party_number = data['party_number']
        nc.order_number = data['order_number']
        nc.manufacture_date = data['manufacture_date']
        nc.total_quantity = data['total_quantity']
        nc.nc_quantity = data['nc_quantity']
        nc.packing_type = data['packing_type']
        nc.provider_id = data['provider']
        nc.reason = data['reason']
        nc.status = data['status']
        nc.classification = data['classification']
        nc.defect = data['defect']
        nc.analysis_results = data['analysis_results']
        nc.sector = data['sector']

        if data['dep_chief_approved'] == '' or data['dep_chief_approved'] is None:
            nc.phase = 1
        elif data['dep_chief_approved'] is True:
            nc.phase = 2
        else:
            nc.phase = 666  # Відмінено

        nc.save()

        post_files(nc.id, request.FILES, data['old_files'])

        if data['phase'] == 0:
            create_and_send_mail('dep_chief', nc.dep_chief_id, nc.id)
        # elif data['phase'] == 1:
        # Сюди при потребі можна буде дописати відправку листа автору про те, що в полях його акту відбулися зміни.
        #     create_and_send_mail('author', nc.author_id, nc.id)

    return HttpResponse('provider.pk')


@transaction.atomic
@login_required(login_url='login')
@try_except
def dep_chief_approval(request):
    nc = get_object_or_404(Non_compliance, pk=request.POST['nc_id'])
    nc.dep_chief_approved = json.loads(request.POST['approved'])
    if nc.dep_chief_approved is False:
        nc.phase = 666
    else:
        nc.phase = 2
        nc.save()

        director_id = get_director_userprofile_id()
        new_decision = Non_compliance_decision(non_compliance=nc, user_id=director_id, phase=2)
        new_decision.save()

        decisions = json.loads(request.POST['decisions'])
        for decision in decisions:
            user_id = Employee_Seat.objects.values_list('employee_id', flat=True).filter(id=decision['id'])[0]
            if user_id != director_id:
                new_decision = Non_compliance_decision(non_compliance=nc, user_id=user_id, phase=1)
                new_decision.save()
                create_and_send_mail('decisioner', user_id, nc.id)

        create_and_send_mail('author', nc.author_id, nc.id)

    return HttpResponse('ok')


@try_except
def post_files(nc_id, new_files, old_files):
    nc = get_object_or_404(Non_compliance, pk=nc_id)

    for file in new_files.getlist('new_files'):
        Non_compliance_file.objects.create(
            non_compliance=nc,
            file=file,
            name=file.name
        )


@transaction.atomic
@login_required(login_url='login')
@try_except
def post_new_comment(request):
    nc_comment = Non_compliance_comment(author=request.user.userprofile)
    nc_comment.non_compliance_id = request.POST['non_compliance_id']
    nc_comment.comment = request.POST['comment']

    if request.POST['original_comment_id'] != '':
        nc_comment.original_comment_id = request.POST['original_comment_id']

    nc_comment.save()

    post_comment_files(nc_comment, request.FILES)

    if nc_comment.original_comment:
        create_and_send_mail('answer', nc_comment.original_comment.author_id, nc_comment.non_compliance_id)

    create_and_send_mail('author', nc_comment.non_compliance.author_id, nc_comment.non_compliance_id)

    return HttpResponse(json.dumps(get_comments(request.POST['non_compliance_id'])))


@try_except
def post_comment_files(nc_comment_instance, files):
    for file in files.getlist('new_comment_files'):
        Non_compliance_comment_file.objects.create(
            comment=nc_comment_instance,
            file=file,
            name=file.name
        )


@try_except
def post_decision(request):
    decision = json.loads(request.POST['decision'])
    decision_instance = get_object_or_404(Non_compliance_decision, pk=decision['id'])
    decision_instance.decision = decision['decision']
    decision_instance.decision_time = datetime.now(tz=get_current_timezone())
    decision_instance.save()

    if decision_instance.phase == 1:
        phase_one_is_done = not Non_compliance_decision.objects\
            .filter(non_compliance__id=request.POST['nc_id'])\
            .filter(phase=1)\
            .filter(decision__isnull=True)\
            .filter(is_active=True)\
            .exists()

        if phase_one_is_done:
            director_decided = Non_compliance_decision.objects.values_list('decision', flat=True)\
                .filter(non_compliance__id=request.POST['nc_id'])\
                .filter(phase=2)\
                .filter(is_active=True)
            if not director_decided:
                create_and_send_mail('decisioner', get_director_userprofile_id(), decision_instance.non_compliance_id)

    else:  # phase = 2 - рішення директора
        nc_instance = get_object_or_404(Non_compliance, pk=request.POST['nc_id'])
        nc_instance.final_decision = decision['decision']
        nc_instance.final_decision_time = datetime.now(tz=get_current_timezone())
        user_id = Employee_Seat.objects.values_list('employee_id', flat=True).filter(id=request.POST['responsible'])[0]
        nc_instance.responsible_id = user_id
        nc_instance.phase = 3
        nc_instance.save()

    create_and_send_mail('author', decision_instance.non_compliance.author_id, decision_instance.non_compliance_id)

    return HttpResponse(json.dumps(convert_to_localtime(decision_instance.decision_time, 'time')))


@try_except
def get_comments(nc_id):
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
        } for file in Non_compliance_comment_file.objects.filter(comment_id=comment.id).filter(is_active=True)]
    } for comment in Non_compliance_comment.objects
        .filter(non_compliance=nc_id)
        .filter(is_active=True).order_by('-id')]
    return comments


@transaction.atomic
@login_required(login_url='login')
@try_except
def done(request):
    data = json.loads(request.POST.copy()['non_compliance'])
    nc = get_object_or_404(Non_compliance, pk=data['id'])

    if data['final_decision'] == 'Переробка':
        nc.retreatment_date = data['retreatment_date']
        nc.spent_time = data['spent_time']
        nc.people_involved = data['people_involved']
        nc.quantity_updated = data['quantity_updated']
        nc.status_updated = data['status_updated']
    if data['final_decision'] == 'Повернення постачальнику':
        nc.return_date = data['return_date']

    nc.phase = 4
    nc.save()

    create_and_send_mail('author', nc.author_id, nc.id)
    return HttpResponse('ok')
