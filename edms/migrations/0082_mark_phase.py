# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0081_module_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='mark',
            name='phase',
            field=models.BooleanField(default=True),
        ),
    ]
