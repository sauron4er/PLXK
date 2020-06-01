# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0122_document_type_is_changeable'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='approved',
            field=models.NullBooleanField(),
        ),
        migrations.AddField(
            model_name='document',
            name='approved_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
