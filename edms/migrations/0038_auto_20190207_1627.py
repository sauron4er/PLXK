# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0037_auto_20190207_1626'),
    ]

    operations = [
        migrations.AlterField(
            model_name='decree',
            name='number',
            field=models.CharField(max_length=10, blank=True, null=True),
        ),
    ]
