# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0017_seat_is_carry_out_chief'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee_seat',
            name='successor',
            field=models.ForeignKey(blank=True, null=True, related_name='heir', to='edms.Employee_Seat'),
        ),
    ]
