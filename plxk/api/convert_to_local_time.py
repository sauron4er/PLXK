from django.utils import timezone
import pytz
import datetime


def convert_to_localtime(utctime, frmt):
    if frmt == 'day':
        fmt = '%d.%m.%Y'
    else:
        fmt = '%d.%m.%Y %H:%M'

    if not isinstance(utctime, datetime.datetime):
        utctime = datetime.datetime.combine(utctime, datetime.datetime.min.time())

    utc = utctime.replace(tzinfo=pytz.UTC)
    localtz = utc.astimezone(timezone.get_current_timezone())
    return localtz.strftime(fmt)
