# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0083_auto_20190416_1131'),
    ]

    operations = [
        migrations.AddField(
            model_name='module',
            name='description',
            field=models.CharField(max_length=500, null=True),
        ),
    ]
