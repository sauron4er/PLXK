# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0013_auto_20200312_1539'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='is_added_or_cancelled',
            field=models.BooleanField(default=False),
        ),
    ]
