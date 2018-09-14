# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bets', '0011_rate'),
    ]

    operations = [
        migrations.AddField(
            model_name='bet',
            name='rate_points',
            field=models.IntegerField(blank=True, null=True, default=0),
        ),
    ]
