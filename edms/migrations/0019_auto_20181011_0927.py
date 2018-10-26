# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0018_employee_seat_successor'),
    ]

    operations = [
        migrations.RenameField(
            model_name='mark_demand',
            old_name='employee_to_mark',
            new_name='employee',
        ),
        migrations.AlterField(
            model_name='mark_demand',
            name='employee_control',
            field=models.ForeignKey(blank=True, null=True, related_name='demands_controled', to='accounts.UserProfile'),
        ),
    ]
