# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('correspondence', '0009_scope'),
    ]

    operations = [
        migrations.AddField(
            model_name='law',
            name='scope',
            field=models.ForeignKey(default=1, related_name='laws', to='correspondence.Scope'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='request',
            name='scope',
            field=models.ForeignKey(default=1, related_name='products', to='correspondence.Scope'),
            preserve_default=False,
        ),
    ]
