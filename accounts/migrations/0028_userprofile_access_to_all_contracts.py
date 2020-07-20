# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0027_auto_20200615_1631'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='access_to_all_contracts',
            field=models.BooleanField(default=False),
        ),
    ]
