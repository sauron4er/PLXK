# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0073_doc_type_phase_required'),
    ]

    operations = [
        migrations.RenameField(
            model_name='doc_type_phase',
            old_name='queue',
            new_name='phase',
        ),
    ]
