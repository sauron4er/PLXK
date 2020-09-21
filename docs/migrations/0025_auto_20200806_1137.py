# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0024_auto_20200804_1636'),
    ]

    operations = [
        migrations.RenameField(
            model_name='file',
            old_name='is_added_or_cancelled',
            new_name='is_added_or_canceled',
        ),
    ]
