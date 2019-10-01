# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0098_doc_approval_approve_queue'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='editable',
            field=models.BooleanField(default=False),
        ),
    ]
