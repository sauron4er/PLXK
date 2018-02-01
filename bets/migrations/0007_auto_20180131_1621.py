# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bets', '0006_bet_points'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bet',
            name='points',
            field=models.IntegerField(blank=True, null=True, default=0),
        ),
    ]
