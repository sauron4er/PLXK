# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0005_order_doc_is_act'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='act0',
            field=models.BooleanField(default=True),
        ),
    ]
