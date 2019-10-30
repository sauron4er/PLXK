# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0113_auto_20191016_0912'),
    ]

    operations = [
        migrations.AddField(
            model_name='vacation',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
