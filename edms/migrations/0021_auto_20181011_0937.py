# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0020_auto_20181011_0934'),
    ]

    operations = [
        migrations.RenameField(
            model_name='mark_demand',
            old_name='employee_seat',
            new_name='recipient',
        ),
    ]
