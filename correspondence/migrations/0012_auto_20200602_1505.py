# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('correspondence', '0011_auto_20200601_1452'),
    ]

    operations = [
        migrations.AlterField(
            model_name='law',
            name='name',
            field=models.CharField(max_length=500),
        ),
        migrations.AlterField(
            model_name='law',
            name='url',
            field=models.CharField(max_length=500),
        ),
    ]
