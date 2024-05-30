from datetime import date, timedelta
from django.shortcuts import get_object_or_404
from plxk.api.try_except import try_except
from plxk.api.datetime_normalizers import normalize_date
from plxk.api.convert_to_local_time import convert_to_localtime
from edms.models import (Document, Doc_Foyer_Range, Cost_Rates, Cost_Rates_Rate, Cost_Rates_Additional, Doc_Contract_Subject,
                         Doc_Deadline, Doc_Recipient, Decree_Article, Doc_Integer, Doc_Decimal, Client_Requirements,
                         Bag_Test, Bag_Test_File, Bag_Test_Comment, Doc_Boolean, Doc_Department, Doc_Seat,
                         Document_Type_Module)


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
def get_integers(doc_id):
    integers = [{
        'queue': item.queue_in_doc,
        'value': item.integer if item.integer else '---'
    } for item in Doc_Integer.objects.filter(document_id=doc_id).filter(is_active=True)]

    return integers


@try_except
def get_decimal(doc_id):
    try:
        decimal_instance = Doc_Decimal.objects.get(document_id=doc_id, is_active=True)
        decimal = decimal_instance.decimal

        return str(decimal)
    except Doc_Decimal.DoesNotExist:
        return ''


@try_except
def get_booleans(doc_id, doc_type_id):
    booleans = Doc_Boolean.objects.all().filter(document_id=doc_id, is_active=True)
    booleans_list = [{
        'id': bl.id,
        'queue': bl.queue_in_doc,
        'field_name': Document_Type_Module.objects.get(document_type_id=doc_type_id, queue=bl.queue_in_doc, is_active=True).field_name,
        'checked': bl.checked
    } for bl in booleans]
    return booleans_list


@try_except
def get_department(doc_id):
    department_instance = Doc_Department.objects.get(document_id=doc_id, is_active=True)
    return department_instance.department.name


@try_except
def get_seat(doc_id):
    seat_instance = Doc_Seat.objects.get(document_id=doc_id, is_active=True)
    seat = {
        'dep_name': seat_instance.seat.department.name,
        'seat_name': seat_instance.seat.seat
    }
    return seat


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
        'provider': bt_instance.provider.name + ' (' + (bt_instance.provider.country or '') + ')',
        'client': bt_instance.client.name,
        'test_type': bt_instance.test_type,
        'bag_type': bt_instance.bag_type,
        'name': bt_instance.name,
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
        'author_comment': bt_instance.author_comment,
        'files': [{
            'id': file.id,
            'file': file.file.name,
            'name': file.name,
            'field_name': file.field_name
        } for file in Bag_Test_File.objects
            .filter(bag_test=bt_instance)
            .filter(is_active=True)]
    }

    if bt_instance.client_requirements_doc:
        cr_fields = get_client_requirements_fields(bt_instance.client_requirements_doc)
        bt_fields.update({
            'client_requirements_id': bt_instance.client_requirements_doc.id,
            'cr_bag_name': cr_fields['bag_name'],
            'cr_weight_kg': cr_fields['weight_kg'],
            'cr_mf_water': cr_fields['mf_water'],
            'cr_mf_ash': cr_fields['mf_ash'],
            'cr_mf_evaporable': cr_fields['mf_evaporable'],
            'cr_mf_not_evaporable_carbon': cr_fields['mf_not_evaporable_carbon'],
            'cr_main_faction': cr_fields['main_faction'],
            'cr_granulation_lt5': cr_fields['granulation_lt5'],
            'cr_granulation_lt10': cr_fields['granulation_lt10'],
            'cr_granulation_lt20': cr_fields['granulation_lt20'],
            'cr_granulation_lt25': cr_fields['granulation_lt25'],
            'cr_granulation_lt40': cr_fields['granulation_lt40'],
            'cr_granulation_mt20': cr_fields['granulation_mt20'],
            'cr_granulation_mt60': cr_fields['granulation_mt60'],
            'cr_granulation_mt80': cr_fields['granulation_mt80']
        })
    else:
        bt_fields.update({
            'cr_bag_name': bt_instance.bag_name,
            'cr_weight_kg': bt_instance.weight_kg,
            'cr_mf_water': bt_instance.mf_water,
            'cr_mf_ash': bt_instance.mf_ash,
            'cr_mf_evaporable': bt_instance.mf_evaporable,
            'cr_mf_not_evaporable_carbon': bt_instance.mf_not_evaporable_carbon,
            'cr_main_faction': bt_instance.main_faction,
            'cr_granulation_lt5': bt_instance.granulation_lt5,
            'cr_granulation_lt10': bt_instance.granulation_lt10,
            'cr_granulation_lt20': bt_instance.granulation_lt20,
            'cr_granulation_lt25': bt_instance.granulation_lt25,
            'cr_granulation_lt40': bt_instance.granulation_lt40,
            'cr_granulation_mt20': bt_instance.granulation_mt20,
            'cr_granulation_mt60': bt_instance.granulation_mt60,
            'cr_granulation_mt80': bt_instance.granulation_mt80
        })

    if bt_instance.test_date:
        bt_fields.update({
            'test_date': date.strftime(bt_instance.test_date, '%Y-%m-%d') if bt_instance.test_date else '',
            'test_report_date': date.strftime(bt_instance.test_report_date, '%Y-%m-%d') if bt_instance.test_date else '',
            'meets_tech_specs': bt_instance.meets_tech_specs,
            'meets_certificate': bt_instance.meets_certificate,
            'meets_dimensions': bt_instance.meets_dimensions,
            'meets_density': bt_instance.meets_density,
            'meets_client_requirements': bt_instance.meets_client_requirements,
            'tech_conditions_are_in_certificate': bt_instance.tech_conditions_are_in_certificate,
            'sample_is_compliant': bt_instance.sample_is_compliant,
            'results_comments': [{
                'id': comment.id,
                'comment': comment.comment,
                'field_name': comment.field_name
            } for comment in Bag_Test_Comment.objects
                .filter(bag_test=bt_instance)
                .filter(is_active=True)],
        })

    return bt_fields


@try_except
def get_info_on_print(doc_id):
    doc_instance = Document.objects.get(id=doc_id)
    info_on_print = Document_Type_Module.objects.get(document_type=doc_instance.document_type, module_id=8)
    return info_on_print.additional_info
