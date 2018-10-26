# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0022_auto_20181023_1043'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='mark_demand',
            name='timestamp',
        ),
    ]
