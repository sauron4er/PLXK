# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('correspondence', '0006_auto_20200518_1110'),
    ]

    operations = [
        migrations.AlterField(
            model_name='request',
            name='request_term',
            field=models.DateTimeField(blank=True, null=True, default=None),
        ),
    ]
