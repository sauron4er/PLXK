# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bets', '0002_team_logo'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='city',
            field=models.CharField(max_length=200, blank=True, null=True),
        ),
    ]
