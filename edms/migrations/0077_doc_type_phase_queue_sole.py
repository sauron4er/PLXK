# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0076_auto_20190402_1629'),
    ]

    operations = [
        migrations.AddField(
            model_name='doc_type_phase_queue',
            name='sole',
            field=models.BooleanField(default=False),
        ),
    ]
