# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0063_doc_gate'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='decree',
            name='document',
        ),
        migrations.RemoveField(
            model_name='free_time_periods',
            name='document',
        ),
        migrations.DeleteModel(
            name='Decree',
        ),
        migrations.DeleteModel(
            name='Free_Time_Periods',
        ),
    ]
