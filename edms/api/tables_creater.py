from django.conf import settings

testing = settings.STAS_DEBUG
from plxk.api.try_except import try_except
from ..models import Document_Type_Module, Document, File


@try_except
# Функція, яка повертає Boolean чи використовує документ фазу auto_approved
def create_table(doc_type):
    modules_list = get_modules_list(doc_type)

    column_widths = get_column_widths(modules_list)

    table_header = get_table_header(modules_list)

    table_rows = get_table_rows(doc_type, modules_list)

    table = {'column_widths': column_widths, 'header': table_header, 'rows': table_rows}

    return table


@try_except
def get_column_widths(modules):
    column_widths = [{'columnName': 'id', 'width': 35}, {'columnName': 'status', 'width': 30}]

    if any(module['module_id'] == 27 for module in modules):  # packaging_type
        column_widths.append({'columnName': 'packaging_type', 'width': 35})

    return column_widths


@try_except
def get_modules_list(doc_type):
    modules = [{
        'id': module.id,
        'module': module.module.module,
        'field_name': module.field_name,
        'queue': module.queue,
        'module_id': module.module_id
    } for module in Document_Type_Module.objects
        .filter(document_type_id=doc_type)
        .filter(table_view=True)
        .filter(is_active=True)]

    return modules


@try_except
def get_table_header(modules):
    header = [{'name': 'id', 'title': '№'}]

    for module in modules:
        if module['module_id'] == 29:  # auto_approved module
            header.append({
                'name': 'status', 'title': module['field_name']
            })
        elif module['module_id'] == 16:  # text module
            header.append({
                'name': 'text-' + str(module['queue']), 'title': module['field_name']
            })
        else:
            header.append({
                'name': module['module'], 'title': module['field_name']
                # 'name': module['id'], 'title': module['field_name']
            })

    return header


@try_except
def get_table_rows(doc_type, modules):

    documents = Document.objects.all().select_related()\
        .filter(document_type_id=doc_type)\
        .filter(closed=False).order_by('-id')

    if not testing:
        documents = documents.filter(testing=False)

    documents_arranged = [{
        'id': doc.id,
        'status': 'ok' if doc.approved is True else 'in progress' if doc.approved is None else '',
        'texts': get_texts(modules, doc),
        'mockup_type': get_mockup_type(modules, doc),
        'mockup_product_type': get_mockup_product_type(modules, doc),
        'client': get_client(modules, doc),
        'packaging_type': get_packaging_type(modules, doc),
        'doc_gate': doc.gate.all()[0].gate_id if doc.gate.all() else None,
        'files': get_files(modules, doc)
    } for doc in documents]

    for document in documents_arranged:
        if document['texts']:
            for text in document['texts']:
                document.update({text['name']: text['text']})

    return documents_arranged


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
def get_client(modules, doc):
    if any(module['module_id'] == 26 for module in modules):
        return doc.client.all()[0].client.name if doc.client.all() else None
    return None


@try_except
def get_packaging_type(modules, doc):
    if any(module['module_id'] == 27 for module in modules):
        field_queue = next(module['queue'] for module in modules if module["module_id"] == 27)
        return doc.texts.filter(queue_in_doc=field_queue)[0].text if doc.texts.filter(queue_in_doc=field_queue) else None
    return None


@try_except
def get_texts(modules, doc):
    if any(module['module_id'] == 16 for module in modules):
        texts = []
        for module in modules:
            if module['module_id'] == 16:
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
        first_doc_path = doc.path.filter(mark_id=1)

        files = [{
            'id': file.id,
            'file': file.file.name,
            'name': file.name,
        } for file in File.objects
            .filter(document_path=first_doc_path)
            .filter(is_active=1)]

        return files
    return None
