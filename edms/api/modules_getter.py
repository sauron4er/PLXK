from plxk.api.convert_to_local_time import convert_to_localtime
from plxk.api.try_except import try_except
from edms.models import Doc_Foyer_Range, Cost_Rates, Cost_Rates_Rate, Cost_Rates_Additional
from django.shortcuts import get_object_or_404


@try_except
def get_foyer_ranges(doc_id):
    foyer_ranges = [{
        'id': item.id,
        'out': convert_to_localtime(item.out_datetime, 'datetime_picker') if item.out_datetime else '',  # Для react-datetime
        'in': convert_to_localtime(item.in_datetime, 'datetime_picker') if item.in_datetime else '',
        'out_text': convert_to_localtime(item.out_datetime, 'datetime') if item.out_datetime else '',  # Для текстового поля
        'in_text': convert_to_localtime(item.in_datetime, 'datetime') if item.in_datetime else '',
        'saved': True
    } for item in Doc_Foyer_Range.objects.filter(document_id=doc_id).filter(is_active=True)]
    return foyer_ranges


@try_except
def get_cost_rates(doc_id):
    cost_rates = get_object_or_404(Cost_Rates, document_id=doc_id)

    cost_rates_info = {
        'type': 'Основні' if cost_rates.type == 'o' else 'Тимчасові' if cost_rates.type == 't' else 'Планування',  # p
        'accounting': 'Бухгалтерський' if cost_rates.accounting == 'b' else 'Управлінський',  # u
        'product_type': 'Напівфабрикати' if cost_rates.product_type == 'n' else 'Готова продукція',  # p
        'product': cost_rates.product.name,
        'department': cost_rates.product.department,
        'client': cost_rates.client.name if cost_rates.client else '',
        'date_start': convert_to_localtime(cost_rates.date_start, 'day'),
        'signed': cost_rates.signed,
    }

    fields = [{
        'name': field.name.name,
        'unit': field.name.unit,
        'term': field.term,
        'norm': field.norm,
        'comment': field.comment,
    } for field in Cost_Rates_Rate.objects.filter(cost_rates=cost_rates)]
    cost_rates_info.update({'fields': fields})

    additional_fields = [{
        'name': field.name,
        'unit': field.unit,
        'term': field.term,
        'norm': field.norm,
        'comment': field.comment,
    } for field in Cost_Rates_Additional.objects.filter(cost_rates=cost_rates).filter(is_active=True)]
    cost_rates_info.update({'additional_fields': additional_fields})

    return cost_rates_info
