# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0022_contract_edms_doc_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='contract',
            old_name='edms_doc_id',
            new_name='edms_doc',
        ),
    ]
