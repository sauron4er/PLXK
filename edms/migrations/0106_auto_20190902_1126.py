# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0105_auto_20190830_1050'),
    ]

    operations = [
        migrations.RenameField(
            model_name='doc_approval',
            old_name='approval_emp_seat',
            new_name='emp_seat',
        ),
    ]
