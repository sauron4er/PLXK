# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('correspondence', '0007_auto_20200518_1113'),
    ]

    operations = [
        migrations.AddField(
            model_name='client',
            name='country',
            field=models.CharField(max_length=100, default=1),
            preserve_default=False,
        ),
    ]
