# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0009_auto_20200303_0856'),
    ]

    operations = [
        migrations.RenameField(
            model_name='order_doc',
            old_name='canceled_file',
            new_name='cancels_file',
        ),
        migrations.AddField(
            model_name='order_doc',
            name='cancels_code',
            field=models.CharField(max_length=100, blank=True, null=True),
        ),
    ]
