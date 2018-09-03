# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0005_auto_20180620_1603'),
    ]

    operations = [
        migrations.AlterField(
            model_name='document_path',
            name='comment',
            field=models.CharField(max_length=1000, blank=True),
        ),
    ]
