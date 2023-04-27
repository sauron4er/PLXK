from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, Http404
from django.db import transaction
from datetime import date
import json
from plxk.api.try_except import try_except
from plxk.api.datetime_normalizers import date_to_json
from plxk.api.convert_to_local_time import convert_to_localtime
from plxk.api.pagination import sort_query_set, filter_query_set
from plxk.api.global_getters import get_userprofiles_list
from production.api.getters import get_product_types_list, get_certification_types, get_scopes_list
from .models import Counterparty, Counterparty_certificate, Counterparty_certificate_pause
from .api.letters_api import get_letters_list, add_or_change_letter, deactivate_letter
# from .api.counterparty_mail_sender import send_provider_mail


@try_except
def deact_counterparty(request, pk):
    counterparty = get_object_or_404(Counterparty, pk=pk)
    counterparty.is_active = False
    counterparty.save()
    # if counterparty.is_provider:
    #     send_provider_mail('change', counterparty)
    return HttpResponse('')


@login_required(login_url='login')
@try_except
def providers(request):
    products = get_product_types_list('buy')
    edit_access = request.user.userprofile.is_it_admin or request.user.userprofile.providers_add
    return render(request, 'boards/counterparty/providers/providers.html', {
        'products_list': products,
        'edit_access': json.dumps(edit_access)  # Для перетворення True в true
    })


@try_except
def get_providers(request, wood_only, page):
    providers_list = Counterparty.objects.filter(is_provider=True).filter(is_active=True)

    if wood_only == 'true':
        providers_list = providers_list.filter(product__meta_type_id=1)

    providers_list = filter_query_set(providers_list, json.loads(request.POST['filtering']))
    providers_list = sort_query_set(providers_list, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(providers_list, 23)
    try:
        providers_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        providers_page = paginator.page(1)
    except EmptyPage:
        providers_page = paginator.page(1)

    providers_list = [{
        'id': provider.pk,
        'name': provider.name,
        'certificates': get_active_certificates_names(provider),
        'edrpou': provider.edrpou if provider.edrpou else '',
        'added': convert_to_localtime(provider.added, 'day'),
        'author': provider.author.pip,
        'status': get_provider_status(provider)
    } for provider in providers_page.object_list]

    response = {'rows': providers_list, 'pagesCount': paginator.num_pages}
    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@try_except
def get_provider(request, pk):
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
        'commentary': provider_instance.commentary or '',
        'product_id': provider_instance.product.id,
        'product': provider_instance.product.name,
    }

    return HttpResponse(json.dumps({'counterparty': provider, 'scopes': [], 'employees': []}))


@transaction.atomic
@login_required(login_url='login')
@try_except
def post_provider(request):
    data = json.loads(request.POST.copy()['counterparty'])

    if data['id'] == 0:
        provider = Counterparty(is_provider=True, author=request.user.userprofile)
    else:
        provider = get_object_or_404(Counterparty, pk=data['id'])

    provider.name = data['name']
    provider.legal_address = data['legal_address']
    provider.actual_address = data['actual_address']
    provider.edrpou = data['edrpou']
    provider.bank_details = data['bank_details']
    provider.contacts = data['contacts']
    provider.product_id = data['product_id']

    if data['commentary'] != '':
        provider.commentary = data['commentary']

    provider.save()

    # if data['id'] == 0:
    #     send_provider_mail('new', provider)
    # else:
    #     send_provider_mail('change', provider)

    return HttpResponse(provider.pk)


@try_except
def get_certificates(provider_id):
    certificates = [{
        'id': cert.id,
        'certification_type': cert.certification_type.name,
        'number': cert.number,
        'status': get_certificate_status(cert)
    } for cert in Counterparty_certificate.objects.filter(counterparty_id=provider_id).filter(is_active=True)]

    return certificates


@try_except
def get_certification(request, provider_id):
    cert_types = get_certification_types()
    response = {'certificates': get_certificates(provider_id), 'cert_types': cert_types}
    return HttpResponse(json.dumps(response))


@try_except
def post_certificate(request):
    provider_id = request.POST['counterparty_id']
    data = json.loads(request.POST.copy()['certificate'])

    if data['id'] == 0:
        certificate = Counterparty_certificate()
    else:
        certificate = get_object_or_404(Counterparty_certificate, pk=data['id'])

    certificate.counterparty_id = provider_id
    certificate.certification_type_id = data['certification_type_id']
    certificate.number = data['number']
    certificate.declaration = data['declaration']
    certificate.start = data['start']
    certificate.end = data['end']
    certificate.old_plhk_number = data['old_plhk_number']
    certificate.production_groups = data['production_groups']

    certificate.save()

    # provider = get_object_or_404(Counterparty, pk=certificate.counterparty.id)
    # send_provider_mail('change', provider)

    return HttpResponse(certificate.pk)


@try_except
def deact_certificate(request, pk):
    certificate = get_object_or_404(Counterparty_certificate, pk=pk)
    certificate.is_active = False
    certificate.save()

    # provider = get_object_or_404(Counterparty, pk=certificate.counterparty.id)
    # send_provider_mail('change', provider)
    return HttpResponse('')


@try_except
def get_certificate(request, pk):
    certificate_instance = get_object_or_404(Counterparty_certificate, pk=pk)
    certificate = {
        'id': certificate_instance.id,
        'certification_type': certificate_instance.certification_type.name,
        'certification_type_id': certificate_instance.certification_type_id,
        'number': certificate_instance.number,
        'production_groups': certificate_instance.production_groups,
        'declaration': certificate_instance.declaration,
        'start': date_to_json(certificate_instance.start),
        'end': date_to_json(certificate_instance.end) if certificate_instance.end else '',
        'old_plhk_number': certificate_instance.old_plhk_number,
        'pauses': get_pauses(certificate_instance),
        'status': get_certificate_status(certificate_instance)
    }

    return HttpResponse(json.dumps(certificate))


@try_except
def post_certificate_pause(request):
    data = json.loads(request.POST.copy()['pause'])

    if data['id'] == 0:
        pause = Counterparty_certificate_pause()
        pause.certificate_id = request.POST['certificate_id']
    else:
        pause = get_object_or_404(Counterparty_certificate_pause, pk=data['id'])
    pause.pause_start = data['start']
    pause.pause_end = data['end']
    pause.save()

    # provider = get_object_or_404(Counterparty, pk=pause.certificate.counterparty.id)
    # send_provider_mail('change', provider)
    return HttpResponse(pause.id)


@try_except
def get_pauses(certificate):
    blank_pause_for_adding = [{
        'id': 0,
        'start': '',
        'end': ''
    }]

    pauses = [{
        'id': pause.id,
        'start': date_to_json(pause.pause_start),
        'end': date_to_json(pause.pause_end) if pause.pause_end else ''
    } for pause in Counterparty_certificate_pause.objects.filter(certificate=certificate).filter(is_active=True)]

    return blank_pause_for_adding + pauses


@try_except
def deact_cert_pause(request, pk):
    pause = get_object_or_404(Counterparty_certificate_pause, pk=pk)
    pause.is_active = False
    pause.save()
    # provider = get_object_or_404(Counterparty, pk=pause.certificate.counterparty.id)
    # send_provider_mail('change', provider)
    return HttpResponse(pause.id)


@try_except
def get_provider_status(provider):
    certificates = get_certificates(provider.pk)
    if certificates:
        for certificate in certificates:
            if certificate['certification_type'] in ['FSC', 'BSCI'] and certificate['status'] == 'ok':
                return 'ok'
    return 'in progress'


@try_except
def get_certificate_status(certificate):
    today = date.today()
    if certificate.start > today:
        return 'paused'
    elif certificate.end and certificate.end < today:
        return 'ended'
    else:
        pauses = Counterparty_certificate_pause.objects.filter(certificate=certificate).filter(is_active=True)
        for pause in pauses:
            if pause.pause_start <= today:
                if not pause.pause_end or pause.pause_end >= today:
                    return 'paused'
    return 'ok'


@try_except
def get_active_certificates_names(provider):
    certificates_names = ''
    certificates = Counterparty_certificate.objects.filter(counterparty=provider).filter(is_active=True)
    for certificate in certificates:
        status = get_certificate_status(certificate)
        if status == 'ok':
            if certificates_names != '':
                certificates_names = certificates_names + ', ' + certificate.certification_type.name
            else:
                certificates_names = certificates_names + certificate.certification_type.name

    return certificates_names


@login_required(login_url='login')
@try_except
def clients(request):
    products = get_product_types_list('sell')
    edit_access = request.user.userprofile.is_it_admin or request.user.userprofile.clients_add
    return render(request, 'boards/counterparty/clients/clients.html', {
        'products_list': products,
        'edit_access': json.dumps(edit_access)})  # Для перетворення True в true})


@try_except
def get_clients(request, page):
    clients_list = Counterparty.objects.filter(is_provider=False).filter(is_active=True)
    clients_list = filter_query_set(clients_list, json.loads(request.POST['filtering']))
    clients_list = sort_query_set(clients_list, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(clients_list, 23)
    try:
        clients_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        clients_page = paginator.page(1)
    except EmptyPage:
        clients_page = paginator.page(1)

    clients_list = [{
        'id': client.pk,
        'name': client.name,
        'product__name': client.product.name,
        'country': client.country,
        'edrpou': client.edrpou if client.edrpou else '',
    } for client in clients_page.object_list]

    response = {'rows': clients_list, 'pagesCount': paginator.num_pages}
    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@try_except
def get_client(request, pk):
    try:
        client_instance = get_object_or_404(Counterparty, pk=pk)
        client = {
            'id': client_instance.id,
            'name': client_instance.name,
            'legal_address': client_instance.legal_address or '',
            'actual_address': client_instance.actual_address or '',
            'country': client_instance.country or '',
            'edrpou': client_instance.edrpou or '',
            'bank_details': client_instance.bank_details or '',
            'contacts': client_instance.contacts or '',
            'responsible_id': client_instance.responsible_id,
            'responsible': client_instance.responsible.pip if client_instance.responsible else '',
            'product_id': client_instance.product.id,
            'product': client_instance.product.name,
            'scope_id': client_instance.scope_id,
            'scope': client_instance.scope.name if client_instance.scope else '',
            'commentary': client_instance.commentary or '',
            'old_bag_scheme_files': get_bag_scheme_files(client_instance)
        }
    except Http404:
        client = {}
    scopes = get_scopes_list()
    employees = get_userprofiles_list()

    return HttpResponse(json.dumps({'counterparty': client, 'scopes': scopes, 'employees': employees}))


@try_except
def get_bag_scheme_files(client):
    bag_scheme_files = []
    return bag_scheme_files

@login_required(login_url='login')
@try_except
def post_client(request):
    data = json.loads(request.POST.copy()['counterparty'])

    if data['id'] == 0:
        client = Counterparty(is_provider=False, author=request.user.userprofile)
    else:
        client = get_object_or_404(Counterparty, pk=data['id'])

    client.name = data['name']
    client.legal_address = data['legal_address']
    client.actual_address = data['actual_address']
    client.edrpou = data['edrpou']
    client.country = data['country']
    client.bank_details = data['bank_details']
    client.contacts = data['contacts']
    client.scope_id = data['scope_id']
    client.responsible_id = data['responsible_id']
    client.product_id = data['product_id']
    client.old_bag_sheme_files = data['old_bag_scheme_files']
    client.new_bag_sheme_files = data['new_bag_scheme_files']
    if data['commentary'] != '':
        client.commentary = data['commentary']

    client.save()

    arrange_bag_scheme_files(client.id, data['old_bag_scheme_files'], data['new_bag_scheme_files'])

    return HttpResponse(client.pk)


@try_except
def arrange_bag_scheme_files(client_id, old_files, new_files):
    if old_files:
        for old_file in old_files:
            file = get_object_or_404(File, pk=old_file['id'])
            file_change_path_form = FileNewPathForm(doc_request, instance=file)
            if file_change_path_form.is_valid():
                file_change_path_form.save()
            else:
                raise ValidationError('post_modules/post_files/file_change_path_form invalid')

    # Додаємо нові файли:
    if files:
        # Поки що файли додаються тільки якщо документ публікується не як чернетка, тому що
        # для публікації файла необідно мати перший path_id документа, якого нема в чернетці
        if new_path is not None:
            doc_path = get_object_or_404(Document_Path, pk=new_path)
            # Якщо у doc_request нема "Mark" - це створення нового документу, потрібно внести True у first_path:
            first_path = doc_request['mark'] == 1

            for file in files:
                File.objects.create(
                    document_path=doc_path,
                    file=file,
                    name=file.name,
                    first_path=first_path
                )

@try_except
def get_clients_for_product_type(request, product_type='0'):
    clients = Counterparty.objects.all().filter(is_active=True).filter(is_provider=False).order_by('name')

    if product_type != '0':
        clients = clients.filter(product_id=product_type)

    clients_list = [{
        'id': client.pk,
        'name': client.name,
        'country': client.country,
        'product': client.product.name
    } for client in clients]
    return HttpResponse(json.dumps(clients_list))


@try_except
def get_counterparties(request, cp_type=''):
    counterparties = Counterparty.objects.all().filter(is_active=True).order_by('name')

    if cp_type != '':
        counterparties = counterparties.filter(is_provider=(cp_type == 'providers'))

    counterparties_list = [{
        'id': counterparty.pk,
        'name': get_counterparty_name_with_country(counterparty),
        'type': 'provider' if counterparty.is_provider else 'client'
    } for counterparty in counterparties]
    return HttpResponse(json.dumps(counterparties_list))


@try_except
def get_counterparties_for_select(request):
    return HttpResponse(json.dumps(get_counterparties_list_for_select()))


@try_except
def get_counterparties_list_for_select():
    counterparties = Counterparty.objects.all().filter(is_active=True).order_by('name')

    counterparties_list = [{
        'value': counterparty.pk,
        'label': get_counterparty_name_with_country(counterparty),
        'type': 'provider' if counterparty.is_provider else 'client'
    } for counterparty in counterparties]

    return counterparties_list


@try_except
def get_counterparty_name_with_country(counterparty):
    if counterparty.country:
        return counterparty.name + ', ' + counterparty.country
    return counterparty.name


@login_required(login_url='login')
@try_except
def get_google_api(request):
    from my_config import google_api_key
    return HttpResponse(google_api_key)


#  --------------------------------------------------- Letters
@login_required(login_url='login')
@try_except
def get_letters(request, counterparty_id):
    letters = get_letters_list(counterparty_id)
    return HttpResponse(json.dumps(letters))


@login_required(login_url='login')
@try_except
def post_letter(request):
    return HttpResponse(add_or_change_letter(request))


@login_required(login_url='login')
@try_except
def del_letter(request):
    return HttpResponse(deactivate_letter(request.POST['id']))

