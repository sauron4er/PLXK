# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0129_auto_20200724_1046'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_type_module',
            name='field',
            field=models.CharField(max_length=200, blank=True, null=True),
        ),
    ]
