from plxk.api.convert_to_local_time import convert_to_localtime
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
import json
from plxk.api.try_except import try_except
from .models import Counterparty, Counterparty_product
from production.api.getters import get_products_list, get_certification_types


@login_required(login_url='login')
@try_except
def providers(request):
    providers = [{
        'id': provider.pk,
        'name': provider.name,
        'certificates': [],
        'edrpou': provider.edrpou if provider.edrpou else '',
        'added': convert_to_localtime(provider.added, 'day'),
        'author': provider.author.pip,
        'status': 'ok'
    } for provider in Counterparty.objects.filter(is_provider=True).filter(is_active=True).order_by('name')]
    products = get_products_list('buy')
    return render(request, 'boards/counterparty/providers.html', {'providers': providers, 'products_list': products})


@login_required(login_url='login')
@try_except
def get_provider(request, pk):
    provider_instance = get_object_or_404(Counterparty, pk=pk)
    provider = {
        'id': provider_instance.id,
        'name': provider_instance.name,
        'legal_address': provider_instance.legal_address,
        'actual_address': provider_instance.actual_address,
        'edrpou': provider_instance.edrpou or '',
        'added': convert_to_localtime(provider_instance.added, 'day'),
        'author': provider_instance.author.pip,
        'products': get_provider_products(provider_instance.id),
        'status': 'ok'
    }
    edit_access = True
    response = {'provider': provider, 'edit_access': edit_access}
    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@try_except
def post_provider(request):
    data = json.loads(request.POST.copy()['provider'])

    if data['id'] == 0:
        provider = Counterparty(is_provider=True, author=request.user.userprofile)
    else:
        provider = get_object_or_404(Counterparty, pk=data['id'])

    provider.name = data['name']
    if data['legal_address'] != '':
        provider.legal_address = data['legal_address']
    if data['actual_address'] != '':
        provider.actual_address = data['actual_address']
    if data['edrpou'] != '':
        provider.edrpou = data['edrpou']

    provider.save()

    post_provider_products(provider, data['products'])

    return HttpResponse(provider.pk)


@try_except
def post_provider_products(provider, products):
    for product in products:
        if product['status'] == 'new':
            provider_product = Counterparty_product(counterparty=provider, product_type_id=product['id'])
            provider_product.save()
        elif product['status'] == 'delete':
            provider_product = get_object_or_404(Counterparty_product, pk=product['instance_id'])
            provider_product.is_active = False
            provider_product.save()


@try_except
def get_provider_products(provider_id):
    products = [{
        'instance_id': product.id,
        'id': product.product_type_id,
        'name': product.product_type.name,
        'status': 'old'
    } for product in Counterparty_product.objects.filter(counterparty_id=provider_id).filter(is_active=True)]
    return products


@try_except
def get_certification(request, provider_id):
    cert_types = get_certification_types()
    response = {'certificates': [], 'cert_types': cert_types}
    return HttpResponse(json.dumps(response))
