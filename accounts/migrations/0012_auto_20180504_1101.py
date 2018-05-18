# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0011_userprofile_is_bets'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='fired_date',
            field=models.DateField(null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='hired_date',
            field=models.DateField(null=True),
        ),
    ]
