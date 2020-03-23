# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0022_auto_20200304_1057'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='is_doc_order_add',
        ),
    ]
