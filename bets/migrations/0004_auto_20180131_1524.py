# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bets', '0003_team_city'),
    ]

    operations = [
        migrations.AlterField(
            model_name='match',
            name='status',
            field=models.ImageField(blank=True, null=True, upload_to=''),
        ),
        migrations.AlterField(
            model_name='team_in_season',
            name='initial_place',
            field=models.ImageField(blank=True, null=True, upload_to=''),
        ),
    ]
