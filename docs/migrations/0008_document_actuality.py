# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0007_auto_20200120_0954'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='actuality',
            field=models.BooleanField(default=True),
        ),
    ]
