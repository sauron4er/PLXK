# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0004_auto_20180118_1254'),
    ]

    operations = [
        migrations.AddField(
            model_name='order_doc',
            name='is_act',
            field=models.BooleanField(default=True),
        ),
    ]
