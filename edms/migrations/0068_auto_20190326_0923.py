# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0067_mark_demand_phase_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='mark_demand',
            old_name='phase_id',
            new_name='phase',
        ),
    ]
