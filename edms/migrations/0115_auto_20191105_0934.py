# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0114_vacation_is_active'),
    ]

    operations = [
        migrations.RenameField(
            model_name='vacation',
            old_name='begin_date',
            new_name='begin',
        ),
        migrations.RenameField(
            model_name='vacation',
            old_name='end_date',
            new_name='end',
        ),
    ]
