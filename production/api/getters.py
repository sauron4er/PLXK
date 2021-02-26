from production.models import Mockup_type, Mockup_product_type
from correspondence.models import Client
from production.models import Product_type, Certification_type
from plxk.api.try_except import try_except


@try_except
def get_mockup_types_list():
    mockup_types = [{
        'id': mockup_type.pk,
        'name': mockup_type.name
    } for mockup_type in
        Mockup_type.objects.all()
            .filter(is_active=True)
            .order_by('name')]

    return mockup_types


@try_except
def get_mockup_product_types_list():
    mockup_product_types = [{
        'id': mockup_product_type.pk,
        'name': mockup_product_type.name,
        'mockup_type_id': mockup_product_type.mockup_type_id,
        'mockup_type': mockup_product_type.mockup_type.name
    } for mockup_product_type in
        Mockup_product_type.objects.all()
            .filter(is_active=True)
            .order_by('mockup_type__name')
            .order_by('name')]

    return mockup_product_types


@try_except
def get_clients_list(product_type=''):
    clients = Client.objects.all().filter(is_active=True).order_by('name')
    if product_type:
        clients = clients.filter(product_type_id=product_type)

    return [{
        'id': client.pk,
        'name': client.name,
        'country': client.country,
        'product_type': client.product_type.name
    } for client in clients]


@try_except
def get_products_list(direction=''):
    products = Product_type.objects.filter(is_active=True).order_by('name')
    if direction != '':
        products = products.filter(direction=direction)

    return [{
        'id': product.pk,
        'name': product.name,
        'direction': 'Продаємо' if product.direction == 'sell' else 'Купуємо',
    } for product in products]


@try_except
def get_certification_types():
    cert_types = Certification_type.objects.filter(is_active=True).order_by('name')

    return [{
        'id': type.pk,
        'name': type.name,
    } for type in cert_types]
