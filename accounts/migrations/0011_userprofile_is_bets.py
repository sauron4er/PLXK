# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0010_auto_20180122_1635'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_bets',
            field=models.BooleanField(default=False),
        ),
    ]
