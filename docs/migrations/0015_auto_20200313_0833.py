# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0014_file_is_added_or_cancelled'),
    ]

    operations = [
        migrations.AlterField(
            model_name='file',
            name='is_added_or_cancelled',
            field=models.BooleanField(default=True),
        ),
    ]
