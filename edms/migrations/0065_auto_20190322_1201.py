# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0064_auto_20190322_0916'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='carry_out_info',
            name='document',
        ),
        migrations.DeleteModel(
            name='Carry_Out_Info',
        ),
    ]
