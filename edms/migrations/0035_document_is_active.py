# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0034_document_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
