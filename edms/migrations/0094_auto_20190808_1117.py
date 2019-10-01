# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0093_doc_text_queue_in_doc'),
    ]

    operations = [
        migrations.AddField(
            model_name='doc_sign',
            name='is_active',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='doc_text',
            name='queue_in_doc',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
