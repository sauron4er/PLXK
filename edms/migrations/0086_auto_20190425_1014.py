# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0085_auto_20190425_0943'),
    ]

    operations = [
        migrations.AlterField(
            model_name='document_type_module',
            name='field_name',
            field=models.CharField(max_length=200),
        ),
    ]
