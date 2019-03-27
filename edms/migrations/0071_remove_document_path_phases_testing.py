# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0070_document_path_phases_testing'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='document_path',
            name='phases_testing',
        ),
    ]
