# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0104_auto_20190830_1046'),
    ]

    operations = [
        migrations.AlterField(
            model_name='file',
            name='first_path',
            field=models.BooleanField(verbose_name=True, default=0),
            preserve_default=False,
        ),
    ]
