# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0099_file_editable'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='first_path',
            field=models.BooleanField(default=False),
        ),
    ]
