# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0044_doc_day'),
    ]

    operations = [
        migrations.AddField(
            model_name='doc_approval',
            name='declined',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='doc_approval',
            name='declined_path',
            field=models.ForeignKey(null=True, related_name='path_decline', to='edms.Document_Path', on_delete=models.deletion.RESTRICT),
        ),
    ]
