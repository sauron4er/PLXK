# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0002_auto_20180530_1051'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee_seat',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
