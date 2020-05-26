import json
from django.shortcuts import render
from django.http import HttpResponse
from .models import Mockup_type, Mockup_product_type


def get_mockup_types(request):
    mockup_types = [{
        'id': mockup_type.pk,
        'name': mockup_type.name
    } for mockup_type in
        Mockup_type.objects.all().filter(is_active=True)]

    return HttpResponse(json.dumps(mockup_types))


def get_mockup_product_types(request):
    mockup_product_types = [{
        'id': mockup_product_type.pk,
        'name': mockup_product_type.name,
        'mockup_type_id': mockup_product_type.mockup_type_id
    } for mockup_product_type in
        Mockup_product_type.objects.all().filter(is_active=True)]

    return HttpResponse(json.dumps(mockup_product_types))

