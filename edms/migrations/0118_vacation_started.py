# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0117_auto_20191106_0906'),
    ]

    operations = [
        migrations.AddField(
            model_name='vacation',
            name='started',
            field=models.BooleanField(default=False),
        ),
    ]
