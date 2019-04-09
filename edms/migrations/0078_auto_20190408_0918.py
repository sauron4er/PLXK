# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0077_doc_type_phase_queue_sole'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='doc_type_phase_queue',
            name='sole',
        ),
        migrations.AddField(
            model_name='doc_type_phase',
            name='sole',
            field=models.BooleanField(default=False),
        ),
    ]
