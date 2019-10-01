# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0096_auto_20190809_1633'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doc_approval',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
