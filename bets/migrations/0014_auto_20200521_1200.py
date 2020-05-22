# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bets', '0013_auto_20180918_0903'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='rate',
            name='match',
        ),
        migrations.DeleteModel(
            name='Rate',
        ),
    ]
