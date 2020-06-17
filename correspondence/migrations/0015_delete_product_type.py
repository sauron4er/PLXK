# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('correspondence', '0014_auto_20200616_1027'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Product_type',
        ),
    ]
