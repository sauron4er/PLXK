# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('correspondence', '0005_auto_20200514_0936'),
    ]

    operations = [
        migrations.AlterField(
            model_name='request',
            name='answer',
            field=models.CharField(max_length=5000, blank=True, null=True, default=None),
        ),
        migrations.AlterField(
            model_name='request',
            name='answer_date',
            field=models.DateTimeField(blank=True, null=True, default=None),
        ),
        migrations.AlterField(
            model_name='request',
            name='request_term',
            field=models.DateTimeField(null=True, default=None),
        ),
    ]
