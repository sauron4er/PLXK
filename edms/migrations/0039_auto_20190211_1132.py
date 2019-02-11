# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0038_auto_20190207_1627'),
    ]

    operations = [
        migrations.RenameField(
            model_name='doc_approval',
            old_name='approved_doc_path',
            new_name='approved_path',
        ),
    ]
