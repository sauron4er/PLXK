# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0054_doc_recipient_doc_text'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_type_module',
            name='required',
            field=models.BooleanField(default=False),
        ),
    ]
