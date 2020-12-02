# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0013_auto_20180525_1146'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='chief',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='fired_date',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='hired_date',
        ),
        migrations.AddField(
            model_name='userprofile',
            name='acting',
            field=models.ForeignKey(blank=True, null=True, to='accounts.UserProfile', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='on_vacation',
            field=models.BooleanField(default=False),
        ),
    ]
