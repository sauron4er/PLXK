# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0003_document_flow'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='document',
            name='employee',
        ),
        migrations.AddField(
            model_name='document',
            name='employee_seat',
            field=models.ForeignKey(default=1, related_name='initiated_documents', to='edms.Employee_Seat'),
            preserve_default=False,
        ),
    ]
