# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('production', '0002_product_type'),
        ('correspondence', '0013_auto_20200603_0936'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='request',
            name='product_type',
        ),
        migrations.AddField(
            model_name='client',
            name='product_type',
            field=models.ForeignKey(default=2, related_name='clients', to='production.Product_type', on_delete=models.deletion.RESTRICT),
            preserve_default=False,
        ),
    ]
