from datetime import date, timedelta
from django.shortcuts import get_object_or_404
from plxk.api.try_except import try_except
from plxk.api.datetime_normalizers import normalize_date
from plxk.api.convert_to_local_time import convert_to_localtime
from edms.models import Doc_Foyer_Range, Cost_Rates, Cost_Rates_Rate, Cost_Rates_Additional, Doc_Contract_Subject, \
    Doc_Deadline, Doc_Recipient, Decree_Article, Doc_Integer, Doc_Decimal, Client_Requirements, Bag_Test


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


@try_except
def get_contract_subject(doc_modules, doc_id):
    try:
        dcs_instance = Doc_Contract_Subject.objects\
            .get(document_id=doc_id, is_active=True)

        if dcs_instance.contract_subject:
            doc_modules.update({'contract_subject': dcs_instance.contract_subject.id})
            doc_modules.update({'contract_subject_name': dcs_instance.contract_subject.name})
        else:
            doc_modules.update({'contract_subject_text': dcs_instance.text})

        return doc_modules

    except Doc_Contract_Subject.DoesNotExist:
        return doc_modules


@try_except
def get_deadline(doc):
    try:
        deadline_instance = doc.deadline.get(is_active=True)
        deadline = deadline_instance.deadline

        days_remains = (deadline_instance.deadline - date.today()).days

        if doc.approved:
            status = ''
        else:
            status = 'good' if days_remains > 2 else 'alert' if days_remains > 0 else 'danger'

        return {'deadline': normalize_date(deadline), 'status': status}
    except Doc_Deadline.DoesNotExist:
        return ''


@try_except
def get_employee_seat(doc):
    try:
        emp_seat_instance = Doc_Recipient.objects.get(document_id=doc.id, is_active=True)

        employee_seat = {
            'id': emp_seat_instance.id,
            'name': emp_seat_instance.recipient.employee.pip,
            'seat': emp_seat_instance.recipient.seat.seat
            if emp_seat_instance.recipient.is_main
            else '(в.о.) ' + emp_seat_instance.recipient.seat.seat,
        }

        return employee_seat

    except Doc_Recipient.DoesNotExist:
        return ''


@try_except
def get_decree_articles(doc):
    decree_articles_query = Decree_Article.objects.prefetch_related('responsibles').filter(document_id=doc.id, is_active=True)

    if decree_articles_query:

        decree_articles = [{
            'id': article.id,
            'text': article.text,
            'term': article.term,
            'deadline': date.strftime(article.deadline, '%Y-%m-%d') if article.deadline else '',
            'status': 'old',
            # 'deadline': normalize_date(article.deadline) if article.deadline else '',
            'periodicity': article.periodicity or '',
            'responsibles': [{
                'article_responsible_id': responsible.id,
                'id': responsible.responsible.id,
                'name': responsible.responsible.employee.pip +
                        ', ' + (responsible.responsible.seat.seat
                                if responsible.responsible.is_main is True
                                else responsible.responsible.seat.seat + ' (в.о.)'),
                'status': 'old',

            } for responsible in article.responsibles.filter(is_active=True)],
        } for article in decree_articles_query]

        return decree_articles
    else:
        return ''


@try_except
def get_integer(doc_id):
    try:
        integer_instance = Doc_Integer.objects.get(document_id=doc_id, is_active=True)
        integer = integer_instance.integer

        return integer
    except Doc_Integer.DoesNotExist:
        return ''


@try_except
def get_decimal(doc_id):
    try:
        decimal_instance = Doc_Decimal.objects.get(document_id=doc_id, is_active=True)
        decimal = decimal_instance.decimal

        return str(decimal)
    except Doc_Decimal.DoesNotExist:
        return ''


@try_except
def get_client_requirements_fields(doc_id):
    cr_instance = Client_Requirements.objects.get(document_id=doc_id, is_active=True)

    cr = {
        'bag_name': cr_instance.bag_name,
        'weight_kg': cr_instance.weight_kg,
        'mf_water': cr_instance.mf_water,
        'mf_ash': cr_instance.mf_ash,
        'mf_evaporable': cr_instance.mf_evaporable,
        'mf_not_evaporable_carbon': cr_instance.mf_not_evaporable_carbon,
        'main_faction': cr_instance.main_faction,
        'granulation_lt5': cr_instance.granulation_lt5,
        'granulation_lt10': cr_instance.granulation_lt10,
        'granulation_lt20': cr_instance.granulation_lt20,
        'granulation_lt25': cr_instance.granulation_lt25,
        'granulation_lt40': cr_instance.granulation_lt40,
        'granulation_mt20': cr_instance.granulation_mt20,
        'granulation_mt60': cr_instance.granulation_mt60,
        'granulation_mt80': cr_instance.granulation_mt80,
    }

    return cr


@try_except
def get_bag_test_fields(doc_id):
    bt_instance = Bag_Test.objects.get(document_id=doc_id, is_active=True)

    bt_fields = {
        'provider': bt_instance.provider.name,
        'client': bt_instance.client.name,
        'test_type': bt_instance.test_type,
        'bag_type': bt_instance.bag_type,
        'length': bt_instance.length,
        'width': bt_instance.width,
        'depth': bt_instance.depth,
        'density': bt_instance.density,
        'weight': bt_instance.weight,
        'material': bt_instance.material,
        'layers': bt_instance.layers,
        'color': bt_instance.color,
        'deadline': date.strftime(bt_instance.deadline, '%Y-%m-%d') if bt_instance.deadline else '',
        'samples_are_available': bt_instance.samples_are_available,
        'author_comment': bt_instance.author_comment
    }

    if bt_instance.client_requirements_doc:
        pass
    else:
        bt_fields.update({
            'bag_name': bt_instance.bag_name,
            'weight_kg': bt_instance.weight_kg,
            'mf_water': bt_instance.mf_water,
            'mf_ash': bt_instance.mf_ash,
            'mf_evaporable': bt_instance.mf_evaporable,
            'mf_not_evaporable_carbon': bt_instance.mf_not_evaporable_carbon,
            'main_faction': bt_instance.main_faction,
            'granulation_lt5': bt_instance.granulation_lt5,
            'granulation_lt10': bt_instance.granulation_lt10,
            'granulation_lt20': bt_instance.granulation_lt20,
            'granulation_lt25': bt_instance.granulation_lt25,
            'granulation_lt40': bt_instance.granulation_lt40,
            'granulation_mt20': bt_instance.granulation_mt20,
            'granulation_mt60': bt_instance.granulation_mt60,
            'granulation_mt80': bt_instance.granulation_mt80
        })

    return bt_fields
