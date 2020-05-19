import json
from correspondence.forms import NewRequestForm, DeactivateRequestForm, NewRequestLawForm, DeactivateRequestLawForm
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from correspondence.models import Request, Request_file, Answer_file, Request_law


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
        request_files = files.getlist('new_request_files')
        answer_files = files.getlist('new_answer_files')
        req = get_object_or_404(Request, pk=post_request['id'])

        for file in request_files:
            Request_file.objects.create(
                request=req,
                file=file,
                name=file.name
            )

        for file in answer_files:
            Answer_file.objects.create(
                request=req,
                file=file,
                name=file.name
            )
    except Exception as err:
        raise err


def deactivate_files(request):
    try:
        test = 1
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
                req_law_instance = get_object_or_404(Request_law, pk=post_request['???'])
                post_request.update({'is_active': False})
                deact_req_law_form = DeactivateRequestLawForm(post_request, instance=req_law_instance)
                if deact_req_law_form.is_valid():
                    deact_req_law_form.save()
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