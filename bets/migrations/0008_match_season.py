# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bets', '0007_auto_20180131_1621'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='season',
            field=models.ForeignKey(blank=True, null=True, default=1, related_name='season1', on_delete='CASCADE', to='bets.Season'),
        ),
    ]
