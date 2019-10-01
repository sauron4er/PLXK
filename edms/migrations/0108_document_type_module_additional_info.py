# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0107_file_deactivate_path'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_type_module',
            name='additional_info',
            field=models.CharField(max_length=200, null=True),
        ),
    ]
