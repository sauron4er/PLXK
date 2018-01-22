# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0009_auto_20180118_1254'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_doc_add',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='is_doc_order_add',
            field=models.BooleanField(default=False),
        ),
    ]
