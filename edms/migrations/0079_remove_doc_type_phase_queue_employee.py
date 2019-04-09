# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0078_auto_20190408_0918'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='doc_type_phase_queue',
            name='employee',
        ),
    ]
