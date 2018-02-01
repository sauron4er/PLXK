# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bets', '0004_auto_20180131_1524'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bet',
            name='team1_bet',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='bet',
            name='team2_bet',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='match',
            name='status',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='match',
            name='team1_result',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='match',
            name='team2_result',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='team_in_season',
            name='initial_place',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
