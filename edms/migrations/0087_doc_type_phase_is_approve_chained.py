# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0086_auto_20190425_1014'),
    ]

    operations = [
        migrations.AddField(
            model_name='doc_type_phase',
            name='is_approve_chained',
            field=models.BooleanField(default=False),
        ),
    ]
