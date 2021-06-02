from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.db import transaction
from datetime import date
import json

from edms.api.vacations import vacation_check
from edms.models import Seat, Employee_Seat
from plxk.api.try_except import try_except
from plxk.api.datetime_normalizers import date_to_json
from plxk.api.convert_to_local_time import convert_to_localtime
from plxk.api.pagination import sort_query_set, filter_query_set
from plxk.api.global_getters import get_userprofiles_list
from production.api.getters import get_products_list, get_certification_types, get_scopes_list
from .models import Counterparty, Counterparty_certificate, Counterparty_certificate_pause
from .models import Non_compliance
# from .api.counterparty_mail_sender import send_provider_mail


@login_required(login_url='login')
@try_except
def non_compliances(request):
    department_chief_seat = Seat.objects.values_list('id', flat=True)\
        .filter(department=request.user.userprofile.department)\
        .filter(is_dep_chief=True)
    if not department_chief_seat:
        # TODO повертати помилку "у підрозділа нема призначеної керівної посади"
        return render(request, 'boards/non_compliances/non_compliances.html')

    dep_chief = Employee_Seat.objects.values_list('id', flat=True)\
        .filter(seat_id=department_chief_seat[0])\
        .filter(is_main=True)\
        .filter(is_active=True)

    if not dep_chief:
        # TODO повертати помилку "у підрозділа нема призначеного керівника"
        return render(request, 'boards/non_compliances/non_compliances.html')

    dep_chief_acting = vacation_check(dep_chief[0])

    dep_chief_acting = get_object_or_404(Employee_Seat, pk=dep_chief_acting)

    dep_chief_acting = {
        'id': dep_chief_acting.employee.id,
        'name': dep_chief_acting.employee.pip + (' (в.о.)' if dep_chief != dep_chief_acting else '')
    }

    products = get_products_list()

    return render(request, 'boards/non_compliances/non_compliances.html', {
        'dep_chief': dep_chief_acting
    })


@try_except
def get_non_compliances(request, page):
    # ncs_list = Counterparty.objects.filter(is_provider=True).filter(is_active=True)

    # ncs_list = filter_query_set(ncs_list, json.loads(request.POST['filtering']))
    # ncs_list = sort_query_set(ncs_list, request.POST['sort_name'], request.POST['sort_direction'])
    #
    # paginator = Paginator(ncs_list, 23)
    # try:
    #     ncs_page = paginator.page(int(page) + 1)
    # except PageNotAnInteger:
    #     ncs_page = paginator.page(1)
    # except EmptyPage:
    #     ncs_page = paginator.page(1)
    #
    # ncs_list = [{
    #     'id': nc.pk,
    #     'product': nc.product,
    #     'client': nc.client,
    #     'author': nc.author.pip,
    #     'responsible': nc.responsible.pip,
    #     'status': get_provider_status(nc)
    # } for nc in ncs_page.object_list]
    #
    # response = {'rows': ncs_list, 'pagesCount': paginator.num_pages}
    # return HttpResponse(json.dumps(response))
    return HttpResponse(json.dumps([]))


@login_required(login_url='login')
@try_except
def get_non_compliance(request, pk):
    provider_instance = get_object_or_404(Counterparty, pk=pk)
    provider = {
        'id': provider_instance.id,
        'name': provider_instance.name,
        'legal_address': provider_instance.legal_address or '',
        'actual_address': provider_instance.actual_address or '',
        'edrpou': provider_instance.edrpou or '',
        'bank_details': provider_instance.bank_details or '',
        'contacts': provider_instance.contacts or '',
        'added': convert_to_localtime(provider_instance.added, 'day'),
        'author': provider_instance.author.pip,
        'product_id': provider_instance.product.id,
        'product': provider_instance.product.name,
    }

    return HttpResponse(json.dumps({'counterparty': provider, 'scopes': [], 'employees': []}))


@transaction.atomic
@login_required(login_url='login')
@try_except
def post_non_compliance(request):
    data = json.loads(request.POST.copy()['non_compliance'])

    if data['id'] == 0:
        nc = Non_compliance(author=request.user.userprofile)
        # provider = Counterparty(is_provider=True, author=request.user.userprofile)
    else:
        pass
        # provider = get_object_or_404(Counterparty, pk=data['id'])

    # next_phase
    # if data['phase'] == 2:

    # provider.name = data['name']
    # provider.legal_address = data['legal_address']
    # provider.actual_address = data['actual_address']
    # provider.edrpou = data['edrpou']
    # provider.bank_details = data['bank_details']
    # provider.contacts = data['contacts']
    # provider.product_id = data['product_id']
    # provider.save()

    # if data['id'] == 0:
    #     send_provider_mail('new', provider)
    # else:
    #     send_provider_mail('change', provider)

    return HttpResponse('provider.pk')


@transaction.atomic
@login_required(login_url='login')
@try_except
def dc_approval(request):
    approved = json.loads(request.POST['approved'])
    return HttpResponse('ok')


@try_except
def get_provider_status(provider):
    certificates = get_certificates(provider.pk)
    if certificates:
        for certificate in certificates:
            if certificate['certification_type'] in ['FSC', 'BSCI'] and certificate['status'] == 'ok':
                return 'ok'
    return 'in progress'
