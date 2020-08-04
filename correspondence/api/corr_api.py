import json
from correspondence.forms import NewRequestForm, DeactivateRequestForm, NewRequestLawForm, DeactivateRequestLawForm, \
    DeactivateRequestFileForm, DeactivateAnswerFileForm, NewAcquaintForm, DeactivateAcquaintForm
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from correspondence.models import Request, Request_file, Answer_file, Request_law, Request_acquaint


def new_req(request):
    try:
        post_request = request.POST.copy()
        new_req_form = NewRequestForm(post_request)

        if new_req_form.is_valid():
            new_req = new_req_form.save(commit=False)
            new_req.added_by = request.user
            new_req.save()
        else:
            raise ValidationError('correspondence/api/corr_api: function post_req: form invalid')

        return new_req.pk
    except Exception as err:
        raise err


def edit_req(post_request):
    try:
        req_instance = get_object_or_404(Request, pk=post_request['request'])
        edit_req_form = NewRequestForm(post_request, instance=req_instance)

        if edit_req_form.is_valid():
            edit_req = edit_req_form.save(commit=False)
            edit_req.last_updated_by = post_request['user']
            edit_req.save()
        else:
            raise ValidationError('correspondence/api/corr_api: function post_req: form invalid')

    except Exception as err:
        raise err


def post_files(files, post_request):
    try:
        new_request_files = files.getlist('new_request_files')
        new_answer_files = files.getlist('new_answer_files')
        old_request_files = json.loads(post_request['old_request_files'])
        old_answer_files = json.loads(post_request['old_answer_files'])
        req = get_object_or_404(Request, pk=post_request['request'])

        for file in new_request_files:
            Request_file.objects.create(
                request=req,
                file=file,
                name=file.name
            )

        for file in new_answer_files:
            Answer_file.objects.create(
                request=req,
                file=file,
                name=file.name
            )

        for file in old_request_files:
            if file['status'] == 'delete':
                deactivate_request_file(post_request, file)

        for file in old_answer_files:
            if file['status'] == 'delete':
                deactivate_answer_file(post_request, file)

    except Exception as err:
        raise err


def deactivate_request_file(post_request, file):
    try:
        post_request.update({'is_active': False})
        file = get_object_or_404(Request_file, pk=file['id'])
        form = DeactivateRequestFileForm(post_request, instance=file)
        if form.is_valid():
            form.save()
    except Exception as err:
        raise err


def deactivate_answer_file(post_request, file):
    try:
        post_request.update({'is_active': False})
        file = get_object_or_404(Answer_file, pk=file['id'])
        form = DeactivateAnswerFileForm(post_request, instance=file)
        if form.is_valid():
            form.save()
    except Exception as err:
        raise err


def post_req_laws(post_request):
    try:
        laws = json.loads(post_request['laws'])
        for law in laws:
            if law['status'] == 'new':
                post_request.update({'law': law['id']})
                new_req_law_form = NewRequestLawForm(post_request)
                if new_req_law_form.is_valid():
                    new_req_law_form.save()
            if law['status'] == 'delete':
                req_law_instance = get_object_or_404(Request_law, pk=law['req_law_id'])
                post_request.update({'is_active': False})
                deact_req_law_form = DeactivateRequestLawForm(post_request, instance=req_law_instance)
                if deact_req_law_form.is_valid():
                    deact_req_law_form.save()
    except Exception as err:
        raise err


def post_acquaints(post_request):
    try:
        acquaints = json.loads(post_request['acquaints'])
        for acquaint in acquaints:
            if acquaint['status'] == 'new':
                post_request.update({'acquaint': acquaint['id']})
                new_acquaint_form = NewAcquaintForm(post_request)
                if new_acquaint_form.is_valid():
                    new_acquaint_form.save()
            if acquaint['status'] == 'delete':
                acquaint_instance = get_object_or_404(Request_acquaint, pk=acquaint['acquaint_id'])
                post_request.update({'is_active': False})
                deact_acquaint_form = DeactivateAcquaintForm(post_request, instance=acquaint_instance)
                if deact_acquaint_form.is_valid():
                    deact_acquaint_form.save()
    except Exception as err:
        raise err


def deactivate_req(request, pk):
    try:
        req_instance = get_object_or_404(Request, pk=pk)
        req_form = DeactivateRequestForm(request, instance=req_instance)
        if req_form.is_valid():
            req = req_form.save(commit=False)
            req.last_updated_by = request.user
            req.save()
        else:
            raise ValidationError('correspondence/api/corr_api: function deactivate_req: form invalid')
    except Exception as err:
        raise err