# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0010_auto_20180713_1113'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee_seat',
            name='acting_for',
            field=models.ForeignKey(blank=True, null=True, related_name='acting_for_me', to='edms.Employee_Seat', on_delete=models.deletion.RESTRICT),
        ),
    ]
