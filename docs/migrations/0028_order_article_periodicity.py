# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0027_auto_20201027_1652'),
    ]

    operations = [
        migrations.AddField(
            model_name='order_article',
            name='periodicity',
            field=models.CharField(max_length=1, blank=True, null=True),
        ),
    ]
