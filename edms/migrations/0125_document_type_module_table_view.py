# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0124_document_type_table_view'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_type_module',
            name='table_view',
            field=models.BooleanField(default=False),
        ),
    ]
