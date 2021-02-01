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
        'certificates': [],
        'added': convert_to_localtime(provider_instance.added, 'day'),
        'author': provider_instance.author.pip,
        'status': 'ok'
    }
    a=1


@login_required(login_url='login')
@try_except
def post_provider(request):
    provider = json.loads(request.POST.copy()['provider'])

    new_provider = Counterparty(name=provider['name'],
                                is_provider=True,
                                legal_address=provider['legal_address'],
                                actual_address=provider['actual_address'],
                                author=request.user.userprofile)

    new_provider.save()

    return HttpResponse(new_provider.pk)
