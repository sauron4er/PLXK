import json
from plxk.api.try_except import try_except
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from plxk.api.global_getters import get_simple_emp_seats_list
from production.models import Contract_Subject
from edms.api.setters import edit_contract_subject_approval, edit_contract_subject_to_work


@try_except
def add_or_change_contract_subject(request):
    contract_subject = json.loads(request.POST['contract_subject'])

    try:
        cs_instance = Contract_Subject.objects.get(id=contract_subject['id'])
    except Contract_Subject.DoesNotExist:
        cs_instance = Contract_Subject(name=contract_subject['name'])
        cs_instance.save()

    post_contract_subject_approval_list(cs_instance, contract_subject['approval_list'])
    post_contract_subject_to_work_list(cs_instance, contract_subject['to_work_list'])

    return cs_instance.id


@try_except
def deactivate_contract_subject(id):
    cs_instance = Contract_Subject.objects.get(id=id)
    cs_instance.is_active = False
    cs_instance.save()
    return 'ok'


@try_except
def post_contract_subject_approval_list(cs_instance, approval_list):
    for approval in approval_list:
        edit_contract_subject_approval(cs_instance.id, approval)


@try_except
def post_contract_subject_to_work_list(cs_instance, to_work_list):
    for to_work in to_work_list:
        edit_contract_subject_to_work(cs_instance.id, to_work)
