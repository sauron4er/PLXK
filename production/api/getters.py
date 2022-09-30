from ..models import Mockup_type, Mockup_product_type, Product_type, Sub_product_type, Product_meta_type, \
    Certification_type, Scope, Cost_Rates_Product, Cost_Rates_Nom, Contract_Subject
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
def get_scopes_list():
    scopes = [{
        'id': scope.pk,
        'name': scope.name
    } for scope in
        Scope.objects.filter(is_active=True).order_by('name')]

    return scopes


@try_except
def get_products_list(direction=''):
    products = Product_type.objects.filter(is_active=True).order_by('name')
    if direction != '':
        products = products.filter(direction=direction)

    return [{
        'id': product.pk,
        'name': product.name,
        'direction': 'Продаємо' if product.direction == 'sell' else 'Купуємо',
        'type': product.meta_type.name if product.meta_type else '',
    } for product in products]


@try_except
def get_sub_products(direction=''):
    sub_products = Sub_product_type.objects.filter(is_active=True).order_by('name')
    if direction != '':
        sub_products = sub_products.filter(type__direction=direction)

    return [{
        'id': sub_product.pk,
        'name': sub_product.name,
        'direction': sub_product.type.direction,
        'type_id': sub_product.type_id,
    } for sub_product in sub_products]


@try_except
def get_meta_types(direction=''):
    meta_types = Product_meta_type.objects.filter(is_active=True).order_by('name')

    return [{
        'id': meta_type.pk,
        'name': meta_type.name,
    } for meta_type in meta_types]


@try_except
def get_certification_types():
    cert_types = Certification_type.objects.filter(is_active=True).order_by('name')

    return [{
        'id': type.pk,
        'name': type.name,
    } for type in cert_types]


@try_except
def get_cost_rates_product_list():
    cost_rate_products = Cost_Rates_Product.objects.filter(is_active=True).order_by('name')
    return [{
        'id': product.pk,
        'department': product.department,
        'name': product.name,
    } for product in cost_rate_products]


@try_except
def get_cost_rates_fields_list(product_id):
    cost_rate_fields = Cost_Rates_Nom.objects\
        .filter(product_id=product_id)\
        .filter(is_active=True)\
        .order_by('name')
    return [{
        'id': field.pk,
        'name': field.name,
        'unit': field.unit,
        'is_required': field.is_required,
    } for field in cost_rate_fields]


@try_except
def get_contract_subjects():
    contract_subjects = Contract_Subject.objects\
        .prefetch_related('approval_recipients')\
        .prefetch_related('to_work_recipients')\
        .filter(is_active=True)\
        .order_by('name')
    list = [{
        'id': subject.pk,
        'name': subject.name,
        'approval_list': [{
            'approval_id': approval.id,
            'id': approval.recipient.id,
            'name': approval.recipient.employee.pip + ', ' + approval.recipient.seat.seat,
            'status': 'old'
        } for approval in subject.approval_recipients.filter(is_active=True)],
        'to_work_list': [{
            'to_work_id': to_work.id,
            'id': to_work.recipient.id,
            'name': to_work.recipient.employee.pip + ', ' + to_work.recipient.seat.seat,
            'status': 'old'
        } for to_work in subject.to_work_recipients.filter(is_active=True)]
    } for subject in contract_subjects]

    return list
