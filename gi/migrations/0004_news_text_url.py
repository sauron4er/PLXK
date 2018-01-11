# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('gi', '0003_auto_20180110_1340'),
    ]

    operations = [
        migrations.AddField(
            model_name='news',
            name='text_url',
            field=models.URLField(max_length=500, blank=True, null=True),
        ),
    ]
