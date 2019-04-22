# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0080_auto_20190409_0946'),
    ]

    operations = [
        migrations.AddField(
            model_name='module',
            name='name',
            field=models.CharField(max_length=50, default=1),
            preserve_default=False,
        ),
    ]
