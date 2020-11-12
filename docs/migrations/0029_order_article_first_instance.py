# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0028_auto_20201104_1136'),
    ]

    operations = [
        migrations.AddField(
            model_name='order_article',
            name='first_instance',
            field=models.ForeignKey(blank=True, null=True, related_name='next_instances', to='docs.Order_article'),
        ),
    ]
