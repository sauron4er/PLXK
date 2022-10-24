from plxk.api.try_except import try_except
from docs.models import Order_doc, File, Order_article, Article_responsible
from edms.models import Document, Document_Type_Module, Doc_Text, Doc_Recipient, Decree_Article, Doc_Day


@try_except
def post_order_from_edms(edms_doc_id, registration_number):
    edms_doc_instance = Document.objects.get(id=edms_doc_id)

    new_order = Order_doc(edms_doc=edms_doc_instance)
    new_order.name = get_name_from_edms_doc(edms_doc_instance)
    new_order.code = registration_number
    new_order.doc_type_id = get_doc_type_from_edms_doc(edms_doc_instance)
    new_order.created_by = edms_doc_instance.employee_seat.employee.user
    new_order.author = edms_doc_instance.employee_seat.employee.user
    new_order.supervisory_id = get_supervisory_id_from_edms_doc(edms_doc_instance)
    new_order.date_start = get_date_start_from_edms_doc(edms_doc_instance)
    new_order.save()

    post_order_articles(new_order, edms_doc_instance)

    # create_and_save_pdf(new_order)


@try_except
def get_name_from_edms_doc(edms_doc_instance):
    name_field_queue = Document_Type_Module.objects.values_list('queue', flat=True).filter(is_active=True)\
        .get(document_type=edms_doc_instance.document_type, field='name')

    name = Doc_Text.objects.values_list('text', flat=True).filter(is_active=True)\
        .get(document=edms_doc_instance, queue_in_doc=name_field_queue)

    return name


@try_except
def get_doc_type_from_edms_doc(edms_doc_instance):
    type_field_queue = Document_Type_Module.objects.values_list('queue', flat=True).filter(is_active=True)\
        .get(document_type=edms_doc_instance.document_type, field='decree_type')

    type = Doc_Text.objects.values_list('text', flat=True).filter(is_active=True)\
        .get(document=edms_doc_instance, queue_in_doc=type_field_queue)

    if type == 'Наказ':
        return 1
    else:  # 'Розпорядження'
        return 2


@try_except
def get_supervisory_id_from_edms_doc(edms_doc_instance):
    supervisory_id = Doc_Recipient.objects.values_list('recipient__employee__user_id', flat=True).filter(is_active=True)\
        .get(document=edms_doc_instance)

    return supervisory_id


@try_except
def get_date_start_from_edms_doc(edms_doc_instance):
    date_start_field_queue = Document_Type_Module.objects.values_list('queue', flat=True).filter(is_active=True) \
        .get(document_type=edms_doc_instance.document_type, field='date_start')

    date = Doc_Day.objects.values_list('day', flat=True).filter(is_active=True) \
        .get(document=edms_doc_instance, queue_in_doc=date_start_field_queue)

    return date


@try_except
def post_order_articles(order, edms_doc_instance):
    articles = [{
        'text': article.text,
        'term': article.term,
        'deadline': article.deadline,
        'periodicity': article.periodicity,
        'responsibles': [{
            'id': responsible.responsible.id
        }for responsible in article.responsibles.filter(is_active=True)]
    } for article in Decree_Article.objects.prefetch_related('responsibles')
        .filter(document=edms_doc_instance).filter(is_active=True)]

    for article in articles:
        new_article = Order_article(order=order)
        new_article.text = article['text']
        new_article.term = article['term']
        if article['deadline']:
            new_article.deadline = article['deadline']
        if article['periodicity']:
            new_article.periodicity = article['periodicity']
        new_article.save()

        post_article_responsibles(new_article, article['responsibles'])


@try_except
def post_article_responsibles(article, responsibles):
    for responsible in responsibles:
        new_article_responsible = Article_responsible(article=article)
        new_article_responsible.employee_seat_id = responsible['id']
        new_article_responsible.save()


@try_except
def create_and_save_pdf(new_order):
    pass