# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0018_auto_20190507_1132'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='tab_number',
            field=models.CharField(max_length=8, unique=True, null=True),
        ),
    ]
