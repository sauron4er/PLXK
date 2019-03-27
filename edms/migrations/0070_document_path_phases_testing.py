# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0069_document_phases_testing'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_path',
            name='phases_testing',
            field=models.BooleanField(default=False),
        ),
    ]
