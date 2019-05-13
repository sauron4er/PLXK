# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0016_userprofile_tab_number'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_pc_user',
            field=models.BooleanField(default=True),
        ),
    ]
