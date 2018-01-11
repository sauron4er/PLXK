# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('boards', '0003_auto_20171212_1453'),
    ]

    operations = [
        migrations.AlterField(
            model_name='phones',
            name='mobile1',
            field=models.CharField(max_length=11, blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='phones',
            name='mobile2',
            field=models.CharField(max_length=11, blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='phones',
            name='n_main',
            field=models.CharField(max_length=4, blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='phones',
            name='n_mobile',
            field=models.CharField(max_length=4, blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='phones',
            name='n_out',
            field=models.CharField(max_length=11, blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='phones',
            name='n_second',
            field=models.CharField(max_length=4, blank=True, null=True),
        ),
    ]
