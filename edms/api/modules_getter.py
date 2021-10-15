from plxk.api.convert_to_local_time import convert_to_localtime
from plxk.api.try_except import try_except
from edms.models import Doc_Foyer_Range


@try_except
def get_foyer_ranges(doc_id):
    asd = [{
        'id': item.id,
        'out': convert_to_localtime(item.out_datetime, 'datetime_picker'),  # Для react-datetime
        'in': convert_to_localtime(item.in_datetime, 'datetime_picker'),
        'out_text': convert_to_localtime(item.out_datetime, 'datetime'),  # Для текстового поля
        'in_text': convert_to_localtime(item.in_datetime, 'datetime'),
        'saved': True
    } for item in Doc_Foyer_Range.objects.filter(document_id=doc_id).filter(is_active=True)]
    return asd
