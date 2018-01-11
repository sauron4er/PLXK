# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_department_userprofile'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_ticked_admin',
            field=models.BooleanField(default=False),
        ),
    ]
