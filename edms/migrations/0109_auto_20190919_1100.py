# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0108_document_type_module_additional_info'),
    ]

    operations = [
        migrations.RenameField(
            model_name='doc_sign',
            old_name='sign_path',
            new_name='signed_path',
        ),
    ]
