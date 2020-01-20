# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0006_document_act0'),
    ]

    operations = [
        migrations.RenameField(
            model_name='document',
            old_name='act0',
            new_name='is_active',
        ),
    ]
