# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0082_mark_phase'),
    ]

    operations = [
        migrations.RenameField(
            model_name='mark',
            old_name='phase',
            new_name='is_phase',
        ),
    ]
