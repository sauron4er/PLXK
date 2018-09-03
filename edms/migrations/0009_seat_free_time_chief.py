# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0008_document_flow_is_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='seat',
            name='free_time_chief',
            field=models.BooleanField(default=False),
        ),
    ]
