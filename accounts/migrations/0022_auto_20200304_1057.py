# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0021_auto_20190514_0933'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_orders_admin',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='is_pc_user',
            field=models.BooleanField(default=True),
        ),
    ]
