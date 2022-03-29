from docs.models import Document
from plxk.api.datetime_normalizers import normalize_date


def user_can_edit(user):
    return user.is_authenticated and user.has_perm("docs.change_document")


def get_docs_list(fk, list_type=''):
    if fk == '0':
        docs = Document.objects.all().filter(actuality=True).order_by('name')
    elif fk == '666':
        docs = Document.objects.all().filter(actuality=False).order_by('name')
    else:
        docs = Document.objects.all().filter(doc_group=fk).filter(actuality=True).order_by('name')

    if list_type == 'Excel':
        docs_list = [[
            doc.id,
            doc.doc_type.name,
            doc.doc_group.name,
            doc.code,
            doc.name,
            doc.act,
            doc.author,
            doc.responsible,
            normalize_date(doc.date_start)
        ] for doc in docs]
    else:
        docs_list = [{
            'id': doc.id,
            'type_name': doc.doc_type.name,
            'group_name': doc.doc_group.name,
            'code': doc.code,
            'name': doc.name,
            'files': [{
                'id': doc.id,
                'file': doc.doc_file.name,
                'name': doc.doc_file.name[13:43:1] + ('...' if len(doc.doc_file.name) > 43 else '')
            }],
            'act': doc.act,
            'author': doc.author,
            'responsible': doc.responsible,
            'date_start': normalize_date(doc.date_start)
        } for doc in docs]


    return docs_list

