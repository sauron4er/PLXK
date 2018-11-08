# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0028_auto_20181102_1009'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='seat',
            name='is_carry_out_chief',
        ),
        migrations.RemoveField(
            model_name='seat',
            name='is_free_time_chief',
        ),
        migrations.AddField(
            model_name='mark',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
