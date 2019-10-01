# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0091_document_type_module_is_tiny_text_box'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='document_type_module',
            name='is_tiny_text_box',
        ),
    ]
