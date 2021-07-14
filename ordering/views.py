from django.shortcuts import render


def stationery(request):
    return render(request, 'ordering/stationery/stationery.html')
