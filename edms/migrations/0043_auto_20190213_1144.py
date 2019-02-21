# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0042_auto_20190213_1041'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='decree',
            name='is_draft',
        ),
        migrations.AddField(
            model_name='document',
            name='is_draft',
            field=models.BooleanField(default=False),
        ),
    ]
