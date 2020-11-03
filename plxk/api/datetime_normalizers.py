import datetime


def datetime_to_json(data):
    if isinstance(data, datetime.datetime):
        return data.date().__str__()


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
