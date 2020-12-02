# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0019_auto_20181011_0927'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='mark_demand',
            name='employee',
        ),
        migrations.RemoveField(
            model_name='mark_demand',
            name='employee_control',
        ),
        migrations.AddField(
            model_name='mark_demand',
            name='employee_seat',
            field=models.ForeignKey(default=10, related_name='demands_employees', to='edms.Employee_Seat', on_delete=models.deletion.RESTRICT),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='mark_demand',
            name='employee_seat_control',
            field=models.ForeignKey(blank=True, null=True, related_name='demands_controled', to='edms.Employee_Seat', on_delete=models.deletion.RESTRICT),
        ),
    ]
