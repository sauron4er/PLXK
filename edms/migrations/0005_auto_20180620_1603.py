# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0004_auto_20180620_1313'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='document_flow',
            name='employee',
        ),
        migrations.RemoveField(
            model_name='document_path',
            name='employee',
        ),
        migrations.AddField(
            model_name='document_flow',
            name='employee_seat',
            field=models.ForeignKey(default=1, related_name='documents_in_flow', to='edms.Employee_Seat', on_delete=models.deletion.RESTRICT),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='document_path',
            name='employee_seat',
            field=models.ForeignKey(default=1, related_name='documents_path', to='edms.Employee_Seat', on_delete=models.deletion.RESTRICT),
            preserve_default=False,
        ),
    ]
