# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0016_remove_order_doc_cancels_file'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order_doc',
            name='date_canceled',
            field=models.DateField(blank=True, null=True),
        ),
    ]
