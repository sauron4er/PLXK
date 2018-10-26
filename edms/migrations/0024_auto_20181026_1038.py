# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0023_remove_mark_demand_timestamp'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='mark_demand',
            name='done',
        ),
        migrations.AddField(
            model_name='mark_demand',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
