# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0094_auto_20190808_1117'),
    ]

    operations = [
        migrations.AddField(
            model_name='doc_sign',
            name='sign_emp_seat',
            field=models.ForeignKey(default=2, related_name='emp_seat_signs', to='edms.Employee_Seat', on_delete=models.deletion.RESTRICT),
            preserve_default=False,
        ),
    ]
