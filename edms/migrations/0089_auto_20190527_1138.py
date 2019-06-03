# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0088_auto_20190527_1122'),
    ]

    operations = [
        migrations.RenameField(
            model_name='doc_acquaint',
            old_name='employee_seat',
            new_name='acquaint_emp_seat',
        ),
        migrations.RenameField(
            model_name='doc_approval',
            old_name='employee_seat',
            new_name='approval_emp_seat',
        ),
    ]
