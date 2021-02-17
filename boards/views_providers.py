from plxk.api.convert_to_local_time import convert_to_localtime
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
import json
from plxk.api.try_except import try_except
from .models import Counterparty


@login_required(login_url='login')
@try_except
def providers(request):
    providers = [{
        'id': provider.pk,
        'name': provider.name,
        'certificates': [],
        'edrpou': provider.edrpou,
        'added': convert_to_localtime(provider.added, 'day'),
        'author': provider.author.pip,
        'status': 'ok'
    } for provider in Counterparty.objects.filter(is_provider=True).filter(is_active=True).order_by('name')]
    return render(request, 'boards/providers/providers.html', {'providers': providers})


@login_required(login_url='login')
@try_except
def get_provider(request, pk):
    provider_instance = get_object_or_404(Counterparty, pk=pk)
    provider = {
        'id': provider_instance.id,
        'name': provider_instance.name,
        'legal_address': provider_instance.legal_address,
        'actual_address': provider_instance.actual_address,
        'edrpou': provider_instance.edrpou,
        'added': convert_to_localtime(provider_instance.added, 'day'),
        'author': provider_instance.author.pip,
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
    return HttpResponse(provider.pk)
