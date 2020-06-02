# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0123_auto_20200601_0929'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_type',
            name='table_view',
            field=models.BooleanField(default=False),
        ),
    ]
