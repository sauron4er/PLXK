# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0095_doc_sign_sign_emp_seat'),
    ]

    operations = [
        migrations.RenameField(
            model_name='doc_approval',
            old_name='approved_path',
            new_name='approve_path',
        ),
        migrations.RemoveField(
            model_name='doc_sign',
            name='sign_emp_seat',
        ),
        migrations.AlterField(
            model_name='doc_approval',
            name='is_active',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='doc_sign',
            name='signed',
            field=models.BooleanField(default=False),
        ),
    ]
