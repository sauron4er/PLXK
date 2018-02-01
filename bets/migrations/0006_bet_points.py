# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bets', '0005_auto_20180131_1526'),
    ]

    operations = [
        migrations.AddField(
            model_name='bet',
            name='points',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
