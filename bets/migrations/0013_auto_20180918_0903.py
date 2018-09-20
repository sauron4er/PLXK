# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bets', '0012_bet_rate_points'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bet',
            name='rate_points',
            field=models.DecimalField(blank=True, null=True, default=0, max_digits=8, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='rate',
            name='draw_rate',
            field=models.DecimalField(blank=True, null=True, max_digits=8, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='rate',
            name='team1_rate',
            field=models.DecimalField(blank=True, null=True, max_digits=8, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='rate',
            name='team2_rate',
            field=models.DecimalField(blank=True, null=True, max_digits=8, decimal_places=2),
        ),
    ]
