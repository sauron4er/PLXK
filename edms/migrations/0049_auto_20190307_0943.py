# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0048_auto_20190307_0911'),
    ]

    operations = [
        migrations.AlterField(
            model_name='option',
            name='option',
            field=models.CharField(max_length=50),
        ),
    ]
