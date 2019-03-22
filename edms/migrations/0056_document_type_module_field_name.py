# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0055_document_type_module_required'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_type_module',
            name='field_name',
            field=models.CharField(max_length=500, default=1),
            preserve_default=False,
        ),
    ]
