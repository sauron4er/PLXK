# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0007_document_flow_expected_mark'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_flow',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
