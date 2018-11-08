# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0025_document_type_creator_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='document_type',
            old_name='creator_id',
            new_name='creator',
        ),
    ]
