# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0101_document_type_module_is_editable'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='file',
            name='version',
            field=models.IntegerField(default=1),
        ),
    ]
