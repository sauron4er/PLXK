# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0092_remove_document_type_module_is_tiny_text_box'),
    ]

    operations = [
        migrations.AddField(
            model_name='doc_text',
            name='queue_in_doc',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
