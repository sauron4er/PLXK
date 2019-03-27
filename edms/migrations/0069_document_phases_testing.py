# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0068_auto_20190326_0923'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='phases_testing',
            field=models.BooleanField(default=False),
        ),
    ]
