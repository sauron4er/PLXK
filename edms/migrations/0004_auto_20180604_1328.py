# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0003_employee_seat_is_active'),
    ]

    operations = [
        migrations.AlterField(
            model_name='employee_seat',
            name='begin_date',
            field=models.DateField(blank=True, null=True, default=django.utils.timezone.now),
        ),
        migrations.AlterField(
            model_name='employee_seat',
            name='end_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
