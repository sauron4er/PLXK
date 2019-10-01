# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0103_auto_20190830_1043'),
    ]

    operations = [
        migrations.AlterField(
            model_name='file',
            name='first_path',
            field=models.NullBooleanField(verbose_name=True),
        ),
    ]
