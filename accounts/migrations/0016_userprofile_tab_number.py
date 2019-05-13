# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0015_userprofile_is_hr'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='tab_number',
            field=models.CharField(max_length=8, blank=True, null=True),
        ),
    ]
