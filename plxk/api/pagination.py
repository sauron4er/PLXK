from django.db.models import Q
from plxk.api.try_except import try_except


@try_except
def sort_query_set(query_set, column, direction):
    if column:
        if column == 'counterparty':
            column = 'counterparty_link__name'

        if direction == 'asc':
            query_set = query_set.order_by(column)
        else:
            query_set = query_set.order_by('-' + column)
    else:
        query_set = query_set.order_by('-id')

    return query_set


@try_except
def filter_query_set(query_set, filtering):
    for filter in filtering:
        if filter['columnName'] == 'certificates':
            # Фільтрація по related полю Сертифікат у таблиці постачальників
            # TODO Переробити на декларативну фільтрацію по related полях.
            # (Звідки таблиця знає, шо поле related? Може знає сам query_set)
            kwargs = {'{}__{}'.format('certificates__certification_type__name', 'icontains'): filter['value']}
        else:
            kwargs = {'{}__{}'.format(filter['columnName'], 'icontains'): filter['value']}
        query_set = query_set.filter(**kwargs)
    return query_set
