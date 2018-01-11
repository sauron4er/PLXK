# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_auto_20180109_1152'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='pip',
            field=models.CharField(max_length=100, blank=True, null=True),
        ),
    ]
