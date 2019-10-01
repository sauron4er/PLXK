# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0111_auto_20190919_1109'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='is_template',
            field=models.BooleanField(default=False),
        ),
    ]
