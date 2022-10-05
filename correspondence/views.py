import json
from datetime import date
from itertools import chain, groupby
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from django.core.exceptions import ValidationError
from django.contrib.auth.decorators import login_required
from plxk.api.try_except import try_except

from production.models import Product_type
from .models import Scope, Law, Law_file, Request, Request_law, Request_file, Answer_file, Law_scope,Request_acquaint
from .forms import NewLawForm, DelLawForm, NewScopeForm, DelScopeForm, NewLawScopeForm
from accounts.models import UserProfile
from .api import corr_api, corr_mail_sender
from boards.models import Counterparty
from plxk.api.datetime_normalizers import date_to_json
from correspondence.api.corr_templates_api import get_corr_templates, add_or_change_corr_template, deactivate_corr_template


def get_request_status(request_date, request_term, answer_date):
    if answer_date:
        return 'ok'
    else:
        if request_term and request_term < date.today():
            return 'overdue'
    return 'in progress'


@login_required(login_url='login')
@try_except
def index(request):
    return render(request, 'correspondence/index.html')


#  --------------------------------------------------- Scope
@try_except
def new_scope(request):
    try:
        scope_form = NewScopeForm(request.POST)
        if scope_form.is_valid():
            scope = scope_form.save()
            return HttpResponse(scope.pk)
        else:
            raise ValidationError('form invalid')
    except Exception as err:
        raise err


@try_except
def del_scope(request):
    try:
        scope_instance = get_object_or_404(Scope, pk=request.POST['id'])
        scope_form = DelScopeForm(request.POST, instance=scope_instance)
        if scope_form.is_valid():
            scope = scope_form.save()
            return HttpResponse(scope.pk)
        else:
            raise ValidationError('form invalid')
    except Exception as err:
        raise err


#  --------------------------------------------------- Laws
@try_except
def post_law(post_request):
    try:
        law_form = NewLawForm(post_request)
        if law_form.is_valid():
            law = law_form.save()
            return law
        else:
            raise ValidationError('form invalid')
    except Exception as err:
        raise err


@try_except
def post_law_files(files, post_request):
    law = get_object_or_404(Law, pk=post_request['id'])

    for file in files.getlist('files'):
        Law_file.objects.create(
            law=law,
            file=file,
            name=file.name
        )


@try_except
def post_law_scopes(post_request):
    scopes = json.loads(post_request['scopes'])
    for scope in scopes:
        post_request.update({'scope': scope['id']})
        law_scope_form = NewLawScopeForm(post_request)
        if law_scope_form.is_valid():
            law_scope_form.save()
        else:
            raise ValidationError('law_scope_form invalid')


@try_except
def new_law(request):
    post_request = request.POST.copy()
    law = post_law(post_request)
    post_request.update({'law': law.pk, 'id': law.pk})
    post_law_scopes(post_request)
    post_law_files(request.FILES, post_request)

    return HttpResponse(law.pk)


@try_except
def del_law(request):
    try:
        law = get_object_or_404(Law, pk=request.POST['id'])
        law_form = DelLawForm(request.POST, instance=law)
        if law_form.is_valid():
            law = law_form.save()
            return HttpResponse(law.pk)
        else:
            raise ValidationError('form invalid')
    except Exception as err:
        raise err


@try_except
def get_laws(request):
    laws = [{
        'id': law.pk,
        'name': law.name,
        'scopes': [{
            'id': scope.scope_id,
            'name': scope.scope.name,
        } for scope in
            Law_scope.objects.all().filter(law_id=law.id).filter(is_active=True)],
    } for law in Law.objects.all().filter(is_active=True).filter(is_actual=True)]

    return HttpResponse(json.dumps(laws))


#  --------------------------------------------------- Requests
@try_except
def get_request(request, pk):
    try:
        req = get_object_or_404(Request, pk=pk)

        edit_mode = request.user.userprofile.is_it_admin or \
                    request.user.pk in (req.added_by_id, req.responsible_id, req.answer_responsible_id, 2, 692)
                                                                    # Тимчасово захардкодені Райчинець, Чобаня
        user_is_author = request.user.pk == req.added_by_id

        req = {
            'id': req.id,
            'unique_number': req.unique_number if req.unique_number else '',
            'type': req.type,
            'author': req.added_by.userprofile.pip,
            'client_id': req.client_id,
            'client_name': req.client.name,
            'scope_id': req.scope_id,
            'scope_name': req.scope.name,
            'product_id': req.client.product_id,
            'product_name': req.client.product.name,
            'answer': req.answer if req.answer else '',
            'request_date': date_to_json(req.request_date),
            'request_term': date_to_json(req.request_term) if req.request_term else '',
            'answer_date': date_to_json(req.answer_date) if req.answer_date else '',
            'responsible_id': req.responsible_id,
            'responsible_name': req.responsible.last_name + ' ' + req.responsible.first_name,
            'answer_responsible_id': req.answer_responsible_id,
            'answer_responsible_name': req.answer_responsible.last_name + ' ' + req.answer_responsible.first_name,
            'author_comment': req.author_comment if req.author_comment else ''
        }

        old_request_files = [{
            'id': file.id,
            'name': file.name,
            'file': file.file.name,
            'status': 'old'
        } for file in Request_file.objects.filter(is_active=True).filter(request_id=req['id'])]

        old_answer_files = [{
            'id': file.id,
            'name': file.name,
            'file': file.file.name,
            'status': 'old'
        } for file in Answer_file.objects.filter(is_active=True).filter(request_id=req['id'])]

        laws = [{
            'req_law_id': req_law.id,
            'id': req_law.law.id,
            'name': req_law.law.name,
            'url': req_law.law.url,
            'status': 'old',
            'files': [{
                'id': file.pk,
                'name': file.name,
                'file': file.file.name,
            } for file in
                Law_file.objects.all().filter(law_id=req_law.law.id).filter(is_active=True)]
        } for req_law in Request_law.objects.filter(is_active=True).filter(request_id=req['id'])]

        acquaints = [{
            'id': acquaint.acquaint.id,
            'acquaint_id': acquaint.id,
            'name': acquaint.acquaint.last_name + ' ' + acquaint.acquaint.first_name,
            'status': 'old',
        } for acquaint in Request_acquaint.objects.filter(is_active=True).filter(request_id=req['id'])]

        req.update({'old_request_files': old_request_files,
                    'old_answer_files': old_answer_files,
                    'laws': laws,
                    'acquaints': acquaints})
        response = {'request': req, 'edit_mode': edit_mode, 'user_is_author': user_is_author}
        return HttpResponse(json.dumps(response))
    except Exception as err:
        raise err


@try_except
def add_request(request):
    try:
        post_request = request.POST.copy()

        new_req_id = corr_api.new_req(request)
        post_request.update({'request': new_req_id})

        corr_api.post_files(request.FILES, post_request)

        if json.loads(post_request['laws']):
            corr_api.post_req_laws(post_request)

        if json.loads(post_request['acquaints']):
            corr_api.post_acquaints(post_request)
            corr_mail_sender.send_acquaints_mails(post_request)

        corr_mail_sender.send_mails(post_request, 'new')

        return HttpResponse(new_req_id)
    except Exception as err:
        raise err


@try_except
def edit_request(request):
    try:
        post_request = request.POST.copy()

        post_request.update({'user': request.user})
        corr_api.edit_req(post_request)

        corr_api.post_files(request.FILES, post_request)

        if json.loads(post_request['laws']):
            corr_api.post_req_laws(post_request)

        if json.loads(post_request['acquaints']):
            corr_api.post_acquaints(post_request)
            corr_mail_sender.send_acquaints_mails(post_request)

        corr_mail_sender.send_mails(post_request, 'edit')

        return HttpResponse(post_request['request'])
    except Exception as err:
        raise err


@try_except
def deactivate_request(request, pk):
    try:
        corr_api.deactivate_req(request, pk)
        return HttpResponse(pk)
    except Exception as err:
        raise err


@try_except
def get_correspondence(request, counterparty):
    all_correspondence = Request.objects.filter(is_active=True).order_by('-id')

    if request.user.userprofile.is_correspondence_view or request.user.userprofile.is_it_admin:
        accessed_correspondence = all_correspondence
    else:
        accessed_correspondence = all_correspondence.filter(added_by=request.user) | \
                                  all_correspondence.filter(responsible=request.user) | \
                                  all_correspondence.filter(answer_responsible=request.user) | \
                                  all_correspondence.filter(acquaints__acquaint=request.user)\
                                      .filter(acquaints__is_active=True)

    if counterparty != '0':
        accessed_correspondence = accessed_correspondence.filter(client_id=counterparty)

    # Прибираємо дублікати, які чомусь створюються у великій кількості при фільтруванні по acquaints_acquaint
    accessed_correspondence = [rows.__next__() for (key, rows) in
                               groupby(accessed_correspondence, key=lambda obj: obj.id)]

    correspondence = [{
        'id': request.pk,
        # 'unique_number': request.unique_number,
        'type': request.type,
        'product_name': request.client.product.name,
        'scope_name': request.scope.name,
        'client_name': request.client.name,
        'client_id': request.client.id,
        'request_date': date_to_json(request.request_date),
        'request_term': date_to_json(request.request_term),
        'answer_date': date_to_json(request.answer_date),
        'responsible_name': request.responsible.last_name + ' ' + request.responsible.first_name,
        'status': get_request_status(request.request_date, request.request_term, request.answer_date),
    } for request in accessed_correspondence]

    return HttpResponse(json.dumps(correspondence))


@try_except
def get_correspondence_info(request):
    scopes = [{
        'id': scope.pk,
        'name': scope.name
    } for scope in
        Scope.objects.all().filter(is_active=True)]

    products = [{
        'id': product.pk,
        'name': product.name
    } for product in
        Product_type.objects.all().filter(is_active=True).filter(direction='sell')]

    clients = [{
        'id': client.pk,
        'name': client.name,
        'country': client.country or '',
        'product_name': client.product.name,
        'product_id': client.product_id,
    } for client in
        Counterparty.objects.filter(is_active=True)]

    laws = [{
        'id': law.pk,
        'name': law.name,
        'url': law.url,
        'scopes': [{
            'id': scope.scope_id,
            'name': scope.scope.name,
        } for scope in
            Law_scope.objects.all().filter(law_id=law.id).filter(is_active=True)],
        'files': [{
            'id': file.pk,
            'name': file.name,
            'file': file.file.name,
        } for file in
            Law_file.objects.all().filter(law_id=law.id).filter(is_active=True)]
    } for law in Law.objects.all().filter(is_active=True).filter(is_actual=True)]

    employees = [{
        'id': employee.user.pk,
        'name': employee.pip,
        'correspondence_admin': employee.is_correspondence_view
    } for employee in UserProfile.objects.only('id', 'pip')
        .filter(is_active=True)
        .exclude(user__isnull=True)
        .exclude(delete_from_noms=True)
        .order_by('pip')]

    return HttpResponse(json.dumps({'clients': clients, 'scopes': scopes, 'products': products,
                                    'laws': laws, 'employees': employees}))


#  --------------------------------------------------- Correspondence Templates
@login_required(login_url='login')
@try_except
def corr_templates(request):
    editable = 'true' if request.user.userprofile.is_it_admin or request.user.userprofile.contract_subject_edit \
        else 'false'
    return render(request, 'corr_templates/index.html', {'corr_templates': get_corr_templates(), 'editable': editable})


@login_required(login_url='login')
@try_except
def post_corr_template(request):
    new_cs_id = add_or_change_corr_template(request)
    return HttpResponse(new_cs_id)


@login_required(login_url='login')
@try_except
def del_corr_template(request):
    return HttpResponse(deactivate_corr_template(request.POST['id']))
