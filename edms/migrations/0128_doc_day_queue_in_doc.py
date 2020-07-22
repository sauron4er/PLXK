# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0127_document_path_path_to_answer'),
    ]

    operations = [
        migrations.AddField(
            model_name='doc_day',
            name='queue_in_doc',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
