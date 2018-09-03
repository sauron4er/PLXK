# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0013_auto_20180829_1019'),
    ]

    operations = [
        migrations.AddField(
            model_name='carry_out_items',
            name='gate',
            field=models.IntegerField(default=1),
        ),
    ]
