# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0102_auto_20190827_1144'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='file',
            name='editable',
        ),
        migrations.AlterField(
            model_name='file',
            name='first_path',
            field=models.NullBooleanField(),
        ),
    ]
