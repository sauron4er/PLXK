# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('correspondence', '0015_delete_product_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='request',
            name='author_comment',
            field=models.CharField(max_length=1000, blank=True, null=True),
        ),
    ]
