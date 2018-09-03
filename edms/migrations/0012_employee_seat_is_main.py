# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0011_employee_seat_acting_for'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee_seat',
            name='is_main',
            field=models.BooleanField(default=True),
        ),
    ]
