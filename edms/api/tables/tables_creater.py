from django.conf import settings
from plxk.api.try_except import try_except
from django.shortcuts import get_object_or_404
from plxk.api.datetime_normalizers import normalize_date
from edms.models import Document_Type_Module, Document, File, Document_Path, Cost_Rates, Doc_Deadline, Bag_Test, Doc_Day, Doc_Contract_Subject
from edms.api.modules_getter import get_seat
from production.models import Contract_Subject
from plxk.api.datetime_normalizers import date_to_json, datetime_to_json, normalize_whole_date
from plxk.api.convert_to_local_time import convert_to_localtime

testing = settings.STAS_DEBUG


@try_except
# Повертає перші 23 рядки з таблиці
def create_table_first(meta_doc_type, counterparty):
    modules_list = get_modules_list(meta_doc_type)
    column_widths = get_column_widths(modules_list)
    table_header = get_table_header(modules_list)
    table_rows = get_table_rows(meta_doc_type, modules_list, 23, counterparty)
    table = {'column_widths': column_widths, 'header': table_header, 'rows': table_rows}
    return table


@try_except
# Повертає всю таблицю
def create_table_all(meta_doc_type, counterparty):
    modules_list = get_modules_list(meta_doc_type)
    table_rows = get_table_rows(meta_doc_type, modules_list, 0, counterparty)
    return table_rows


@try_except
def get_column_widths(modules):
    column_widths = [
        {'columnName': 'id', 'width': 40},
        {'columnName': 'author', 'width': 200},
        {'columnName': 'approved', 'width': 80},
        {'columnName': 'stage', 'width': 100},
        {'columnName': 'importancy', 'width': 90},
        {'columnName': 'department', 'width': 200},
        {'columnName': 'type', 'width': 200},
        {'columnName': 'accounting', 'width': 200},
        {'columnName': 'product_type', 'width': 200},
        {'columnName': 'date_start', 'width': 100},
        {'columnName': 'date_end', 'width': 100},
        {'columnName': 'client', 'width': 250},
        {'columnName': 'choose_company', 'width': 85},
        {'columnName': 'day', 'width': 160},
        {'columnName': 'deadline', 'width': 130},
        {'columnName': 'datetime', 'width': 160},
    ]

    if any(module['module_id'] == 27 for module in modules):  # packaging_type
        column_widths.append({'columnName': 'packaging_type', 'width': 35})

    for module in modules:
        if module['field'] == 'importancy':
            column_widths.append({'columnName': 'text-' + str(module['queue']), 'width': 105})
        elif module['field'] == 'accounting':
            column_widths.append({'columnName': 'text-' + str(module['queue']), 'width': 150})
        elif module['field'] == 'type':
            column_widths.append({'columnName': 'text-' + str(module['queue']), 'width': 150})
        elif module['module'] == 'stage':
            column_widths.append({'columnName': 'added_date', 'width': 100})
            column_widths.append({'columnName': 'done_date', 'width': 100})
        elif module['field'] == 'performer':
            column_widths.append({'columnName': 'text-' + str(module['queue']), 'width': 100})
        elif module['module'] == 'client':
            column_widths.append({'columnName': 'client', 'width': 150})
        elif module['module'] == 'dimensions':
            column_widths.append({'columnName': 'text-' + str(module['queue']), 'width': 55})
        elif module['field'] == 'mockup_type':
            column_widths.append({'columnName': 'mockup_type', 'width': 170})
        elif module['field'] == 'mockup_product_type':
            column_widths.append({'columnName': 'mockup_product_type', 'width': 160})
        elif module['field'] == 'product':
            column_widths.append({'columnName': 'sub_product_type', 'width': 160})
        elif module['field'] == 'scope':
            column_widths.append({'columnName': 'scope', 'width': 160})
        elif module['field'] == 'bag_test':
            column_widths = [
                {'columnName': 'id', 'width': 40},
                {'columnName': 'added_date', 'width': 70},
                {'columnName': 'test_type', 'width': 100},
                {'columnName': 'bag_type', 'width': 100},
                {'columnName': 'provider', 'width': 150},
                {'columnName': 'provider_country', 'width': 100},
                {'columnName': 'client', 'width': 150},
                # {'columnName': 'bag_name', 'width': 100},
                {'columnName': 'dimensions', 'width': 100},
                {'columnName': 'weight', 'width': 70},
                {'columnName': 'status', 'width': 70},
                {'columnName': 'report_date', 'width': 100}
            ]
    return column_widths


@try_except
def get_modules_list(meta_doc_type):
    modules = [{
        'id': module.id,
        'module': module.module.module,
        'field_name': module.field_name,
        'field': module.field,
        'queue': module.queue,
        'module_id': module.module_id
    } for module in Document_Type_Module.objects
        # .filter(document_type_id=)
        .filter(document_type__meta_doc_type_id=meta_doc_type)
        .filter(document_type__is_active=True)
        .filter(table_view=True)
        .filter(is_active=True)
        .order_by('queue')
    ]
    return modules


@try_except
def get_table_header(modules):
    header = [{'name': 'id', 'title': '№'}, {'name': 'author', 'title': 'Автор'}]

    for module in modules:
        if module['module_id'] == 29:  # auto_approved module
            header.append({'name': 'approved', 'title': module['field_name']})
        elif module['module_id'] in [16, 32]:  # text, select
            header.append({'name': 'text-' + str(module['queue']), 'title': module['field_name']})
        elif module['module_id'] == 33:  # stage
            header.append({'name': 'added_date', 'title': 'Створено'})
            header.append({'name': 'done_date', 'title': 'Виконано'})
            header.append({'name': 'stage', 'title': 'Стадія'})
        elif module['module_id'] == 36:  # product_type_sell
            header.append({'name': 'sub_product_type', 'title': 'Тип продукції'})
        elif module['module'] == 'dimensions':
            header.append(get_dimensions_header(module))
        elif module['module'] == 'choose_company':
            header.append({'name': 'choose_company', 'title': 'Підприємство'})
        elif module['field'] == 'date_start':
            header.append({'name': 'date_start', 'title': 'Початок дії'})
        elif module['field'] == 'date_end':
            header.append({'name': 'date_end', 'title': 'Кінець дії'})
        elif module['module'] == 'cost_rates':  # Норми витрат
            header.append({'name': 'product', 'title': 'Продукція'})
            header.append({'name': 'department', 'title': 'Підрозділ'})
            header.append({'name': 'type', 'title': 'Тип норм'})
            header.append({'name': 'accounting', 'title': 'Тип обліку'})
            header.append({'name': 'product_type', 'title': 'Тип продукції'})
            header.append({'name': 'date_start', 'title': 'Дата введення в дію'})
            header.append({'name': 'client', 'title': 'Клієнт'})
        elif module['module'] == 'bag_test':
            header = [
                {'name': 'added_date', 'title': 'Дата заявки'},
                {'name': 'test_type', 'title': 'Тип тесту'},
                {'name': 'bag_type', 'title': 'Тип упаковки'},
                {'name': 'provider', 'title': 'Постачальник'},
                {'name': 'provider_country', 'title': 'Країна'},
                {'name': 'client', 'title': 'Клієнт'},
                {'name': 'bag_name', 'title': 'Назва'},
                {'name': 'dimensions', 'title': 'Розміри'},
                {'name': 'weight', 'title': 'Вага'},
                {'name': 'status', 'title': 'Статус'},
                {'name': 'report_date', 'title': 'Дата звіту'},
                # is_compliant
            ]
            pass
        elif module['module_id'] == 1:
            # Відсортовуємо модуль files
            a = 1
        else:
            header.append({'name': module['module'], 'title': module['field_name']})

    return header


@try_except
def get_table_rows(meta_doc_type, modules, rows_count, counterparty):
    documents = Document.objects.all().select_related()\
        .filter(document_type__meta_doc_type_id=meta_doc_type)\
        .filter(is_template=False)\
        .filter(is_draft=False)\
        .filter(closed=False).order_by('-id')

    if not testing:
        documents = documents.filter(testing=False)

    if counterparty != '0':  # Клієнт
        if any(module['module_id'] in [26, 34] for module in modules):
            documents = documents.filter(counterparty__counterparty_id=counterparty)
        if any(module['module_id'] == 44 for module in modules):  # cost_rates
            documents = documents.filter(cost_rates__client_id=counterparty)

    if rows_count != 0:
        documents = documents[:rows_count]

    # TODO Переробити на підтягування модулів в залежності від їх наявності, а не всіх підряд як зараз

    documents_arranged = [{
        'id': doc.id,
        'author': doc.employee_seat.employee.pip,
        'date_start': get_date_by_field(modules, doc, 'date_start'),
        'date_end': get_date_by_field(modules, doc, 'date_end'),
        'day': get_day(modules, doc),
        'datetime': get_datetime(modules, doc),
        # 'date': datetime_to_json(Document_Path.objects.values('timestamp').filter(document_id=doc.id).filter(mark_id=1)[0]),
        'approved': get_approved(doc),
        # 'status': 'ok' if doc.approved is True else 'in progress' if doc.approved is None else '',
        'stage': get_stage(doc.stage),
        'texts': get_texts(modules, doc),
        'contract_subject': get_contract_subject(modules, doc),
        'mockup_type': get_mockup_type(modules, doc),
        'mockup_product_type': get_mockup_product_type(modules, doc),
        'sub_product_type': get_sub_product_type(modules, doc),
        'scope': get_scope(modules, doc),
        'client': get_counterparty(modules, doc),
        'packaging_type': get_packaging_type(modules, doc),
        'doc_gate': doc.gate.all()[0].gate_id if doc.gate.all() else None,
        # 'files': get_files(modules, doc),
        'choose_company': doc.company + ' ПЛХК',
        'added_date': normalize_whole_date(
            Document_Path.objects.values('timestamp').filter(document_id=doc.id).filter(mark_id=1)[0]),
        'done_date': get_done_date(doc),
        'deadline': get_deadline(modules, doc),
        'dep_seat': get_dep_seat(modules, doc.id),
    } for doc in documents]

    for document in documents_arranged:
        if document['texts']:
            for text in document['texts']:
                document.update({text['name']: text['text']})

    if any(module['module'] == 'cost_rates' for module in modules):
        for document in documents_arranged:
            cost_rates = get_object_or_404(Cost_Rates, document_id=document['id'])
            document.update({'product': cost_rates.product.name})
            document.update({'department': cost_rates.product.department})
            document.update({'type': 'Основні' if cost_rates.type == 'o' else 'Тимчасові' if cost_rates.type == 't' else 'Планування'}),  # p})
            document.update({'accounting': 'Бухгалтерський' if cost_rates.accounting == 'b' else 'Управлінський'}),  # u})
            document.update({'product_type': 'Напівфабрикати' if cost_rates.product_type == 'n' else 'Готова продукція'}),  # p})
            document.update({'date_start': convert_to_localtime(cost_rates.date_start, 'day')})
            document.update({'client': cost_rates.client.name if cost_rates.client else ''})

    if any(module['module'] == 'bag_test' for module in modules):
        for document in documents_arranged:
            bag_test = get_object_or_404(Bag_Test, document_id=document['id'])
            document.update({'test_type': bag_test.test_type})
            document.update({'bag_type': bag_test.bag_type})
            document.update({'provider': bag_test.provider.name})
            document.update({'provider_country': bag_test.provider.country})
            document.update({'client': bag_test.client.name})
            document.update({'bag_name': bag_test.bag_name})
            document.update({'dimensions': bag_test.length + '*' + bag_test.width + '*' + bag_test.depth})
            document.update({'weight': bag_test.weight})
            document.update({'status': get_bag_test_status(bag_test, document['stage'])})
            document.update({'report_date': date_to_json(bag_test.test_report_date)})

    return documents_arranged


@try_except
def get_approved(doc):
    if doc.approved:
        return 'Погоджено'
    elif doc.approved is False:
        if doc.path.filter(mark=26).exists():
            return 'Деактив.'
        elif not doc.is_active:
            return 'Не актуальний'
        return 'Відмовлено'
    return 'Не актуальний' if not doc.is_active or doc.closed else 'В процесі'


@try_except
def get_bag_test_status(bag_test, doc_stage):
    # 1. Тестування не було - in_process. 2. Є позначка "взято у роботу". 3. Протестовано - ок. 4. Протестовано - не ок.
    if bag_test.test_report_date:
        if bag_test.sample_is_compliant:
            return 'ok'
        if not bag_test.sample_is_compliant:
            return 'not ok'
    elif doc_stage == 'В роботі':
        return 'in work'
    return ''
    # elif doc.approved is False:
    #     if doc.path.filter(mark=26).exists():
    #         return 'Деактив.'
    #     elif not doc.is_active:
    #         return 'Не актуальний'
    #     return 'Відмовлено'
    # return 'Не актуальний' if not doc.is_active or doc.closed else 'В процесі'


@try_except
def get_stage(stage):
    if stage == 'done':
        return 'Виконано'
    elif stage == 'confirm':
        return 'Підтверджено'
    elif stage == 'in work':
        return 'В роботі'
    elif stage == 'denied':
        return 'Відмовлено'
    return 'Ініційовано'


@try_except
def get_dimensions_header(module):
    title = ''

    if module['field_name'] == 'Довжина, см':
        title = 'Д'
    elif module['field_name'] == 'Ширина, см':
        title = 'Ш'
    elif module['field_name'] == 'Глибина, см':
        title = 'Г'
    elif module['field_name'] == 'Вага, кг':
        title = 'кг'

    return {'name': 'text-' + str(module['queue']), 'title': title}


@try_except
def get_contract_subject(modules, doc):
    if any(module['module_id'] == 45 for module in modules):
        subject = Doc_Contract_Subject.objects.filter(document=doc).filter(is_active=True)[0]
        if subject:
            return subject.text or subject.contract_subject.name
    return None


@try_except
def get_mockup_type(modules, doc):
    if any(module['module_id'] == 24 for module in modules):
        return doc.mockup_type.all()[0].mockup_type.name if doc.mockup_type.all() else None
    return None


@try_except
def get_mockup_product_type(modules, doc):
    if any(module['module_id'] == 25 for module in modules):
        return doc.mockup_product_type.all()[0].mockup_product_type.name if doc.mockup_product_type.all() else None
    return None


@try_except
def get_sub_product_type(modules, doc):
    if any(module['module_id'] == 36 for module in modules):
        return doc.sub_product_type.all()[0].sub_product_type.name if doc.sub_product_type.all() else None
    return None


@try_except
def get_scope(modules, doc):
    if any(module['module_id'] == 37 for module in modules):
        return doc.scope.all()[0].scope.name if doc.scope.all() else None
    return None


@try_except
def get_counterparty(modules, doc):
    if any(module['module_id'] == 26 for module in modules):
        return doc.counterparty.all()[0].counterparty.name if doc.counterparty.all() else None
    return None


@try_except
def get_packaging_type(modules, doc):
    if any(module['module_id'] == 27 for module in modules):
        field_queue = next(module['queue'] for module in modules if module["module_id"] == 27)
        return doc.texts.filter(queue_in_doc=field_queue)[0].text if doc.texts.filter(queue_in_doc=field_queue) else None
    return None


@try_except
def get_day(modules, doc):
    if any(module['module_id'] == 12 for module in modules):
        return date_to_json(doc.days.all()[0].day) if doc.days.all() else None
    return None


@try_except
def get_date_by_field(modules, doc, field):
    if any(module['field'] == field for module in modules):
        queue = 0
        for module in modules:
            if module['field'] == field:
                queue = module['queue']
                break
        doc_day = Doc_Day.objects.values_list('day', flat=True).filter(document=doc).filter(queue_in_doc=queue).filter(is_active=True)
        if len(doc_day):
            value = Doc_Day.objects.values_list('day', flat=True).filter(document=doc).filter(queue_in_doc=queue).filter(is_active=True)[0]

            if value:
                return normalize_date(value)

    return None


@try_except
def get_datetime(modules, doc):
    if any(module['module_id'] == 41 for module in modules):
        return datetime_to_json(doc.datetimes.all()[0].datetime, 'date_time') if doc.datetimes.all() else None
    return None


@try_except
def get_texts(modules, doc):
    if any(module['module_id'] in [16, 28, 32] for module in modules):
        texts = []
        for module in modules:
            if module['module_id'] in [16, 28, 32]:
                queue = module['queue']
                texts.append(
                    {'name': 'text-' + str(queue),
                     'text': doc.texts.filter(queue_in_doc=queue)[0].text if doc.texts.filter(queue_in_doc=queue) else None}
                )
        return texts
    return None


@try_except
def get_files(modules, doc):
    if any(module['module_id'] == 1 for module in modules):
        files = [{
            'id': file.id,
            'file': file.file.name,
            'name': file.name,
            'version': file.version
        } for file in File.objects
            .filter(document_path__document=doc.id)
            .filter(first_path=True)
            .filter(is_active=True)]

        return files
    return None


@try_except
def get_done_date(doc):
    if doc.stage in ['done', 'confirm']:
        return normalize_whole_date(
            Document_Path.objects.values('timestamp').filter(document_id=doc.id).filter(mark_id=11).order_by('-id')[0]
        )
    return ''


@try_except
def get_deadline(modules, doc):
    if any(module['module'] == 'deadline' for module in modules):
        try:
            deadline_instance = doc.deadline.get(is_active=True)
            return normalize_date(deadline_instance.deadline)
        except Doc_Deadline.DoesNotExist:
            return ''


@try_except
def get_dep_seat(modules, doc_id):
    if any(module['module'] == 'dep_seat' for module in modules):
        seat = get_seat(doc_id)
        return seat['dep_name'] + ' – ' + seat['seat_name']
