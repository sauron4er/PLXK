# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0079_remove_doc_type_phase_queue_employee'),
    ]

    operations = [
        migrations.RenameField(
            model_name='document',
            old_name='phases_testing',
            new_name='testing',
        ),
    ]
