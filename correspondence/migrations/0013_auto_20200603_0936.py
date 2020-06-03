# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('correspondence', '0012_auto_20200602_1505'),
    ]

    operations = [
        migrations.AlterField(
            model_name='request',
            name='answer_date',
            field=models.DateField(blank=True, null=True, default=None),
        ),
        migrations.AlterField(
            model_name='request',
            name='request_date',
            field=models.DateField(),
        ),
        migrations.AlterField(
            model_name='request',
            name='request_term',
            field=models.DateField(blank=True, null=True, default=None),
        ),
    ]
