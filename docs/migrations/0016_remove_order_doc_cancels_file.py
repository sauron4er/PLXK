# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0015_auto_20200313_0833'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='order_doc',
            name='cancels_file',
        ),
    ]
