# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0126_auto_20200603_0947'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_path',
            name='path_to_answer',
            field=models.ForeignKey(blank=True, null=True, related_name='answers', to='edms.Document_Path', on_delete=models.deletion.RESTRICT),
        ),
    ]
