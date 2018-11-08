# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0026_auto_20181101_0848'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_type',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
