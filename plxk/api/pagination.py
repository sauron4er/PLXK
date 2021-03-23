from plxk.api.try_except import try_except


@try_except
def sort_query_set(query_set, column, direction):
    if column:
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
        kwargs = {'{}__{}'.format(filter['columnName'], 'icontains'): filter['value']}
        query_set = query_set.filter(**kwargs)
    return query_set
