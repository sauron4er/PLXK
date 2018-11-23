# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0033_document_type_testing'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='date',
            field=models.DateTimeField(null=True, auto_now_add=True),
        ),
    ]
