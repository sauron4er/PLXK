from datetime import date
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404

from templates.components.try_except import try_except
from ..models import Document_Type_Module, Document


@try_except
# Функція, яка повертає Boolean чи використовує документ фазу auto_approved
def create_table(doc_type):
    modules_list = get_modules_list(doc_type)

    table_header = get_table_header(modules_list)

    table_rows = get_table_rows(doc_type, modules_list)

    table = {'header': table_header, 'rows': table_rows}

    return table


@try_except
def get_modules_list(doc_type):
    modules = [{
        'id': module.id,
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
        if module['module_id'] == 29:
            header.append({
                'name': 'status', 'title': module['field_name']
            })
        else:
            header.append({
                'name': module['id'], 'title': module['field_name']
            })

    return header


@try_except
def get_table_rows(doc_type, modules):
    documents = [{
        'id': doc.id,
        'status': 'ok' if doc.approved is True else 'in progress' if doc.approved is None else ''
    } for doc in Document.objects
        .filter(document_type_id=doc_type)
        .filter(closed=False)]

    return documents
