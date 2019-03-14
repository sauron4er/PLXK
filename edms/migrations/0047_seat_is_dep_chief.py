# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0046_auto_20190301_1351'),
    ]

    operations = [
        migrations.AddField(
            model_name='seat',
            name='is_dep_chief',
            field=models.BooleanField(default=False),
        ),
    ]
