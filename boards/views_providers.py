from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from plxk.api.try_except import try_except


@login_required(login_url='login')
@try_except
def providers(request):
    providers = []
    return render(request, 'boards/providers/providers.html', {'providers': providers})
