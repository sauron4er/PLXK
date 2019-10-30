# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0112_document_is_template'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='doc_preamble',
            name='document',
        ),
        migrations.DeleteModel(
            name='Doc_Preamble',
        ),
    ]
