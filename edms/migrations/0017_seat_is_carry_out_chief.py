# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0016_carry_out_info'),
    ]

    operations = [
        migrations.AddField(
            model_name='seat',
            name='is_carry_out_chief',
            field=models.BooleanField(default=False),
        ),
    ]
