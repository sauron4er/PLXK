import datetime


def datetime_to_json(data, type='date'):
    if isinstance(data, datetime.datetime):
        if type == 'only_date':
            return data.date().__str__()
        elif type == 'date_time':
            return data.strftime("%Y-%m-%d %H:%M")


def date_to_json(data):
    if isinstance(data, datetime.date):
        return data.__str__()


def normalize_date(data):
    if isinstance(data, datetime.date):
        return data.strftime("%d.%m.%Y")


def normalize_month(date):
    return '0' + str(date.month) if date.month < 10 else str(date.month)


def normalize_day(date):
    return '0' + str(date.day) if date.day < 10 else str(date.day)


def normalize_whole_date(date):
    return normalize_day(date['timestamp']) + '.' + normalize_month(date['timestamp']) + '.' + str(date['timestamp'].year)
