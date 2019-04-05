# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0075_auto_20190329_0945'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doc_type_phase_queue',
            name='queue',
            field=models.IntegerField(default=0),
        ),
    ]
