# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0084_module_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='doc_type_phase',
            name='testing',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='document_type_module',
            name='testing',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='document_type_module',
            name='field_name',
            field=models.CharField(max_length=50),
        ),
    ]
