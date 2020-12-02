# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0021_auto_20181011_0937'),
    ]

    operations = [
        migrations.AddField(
            model_name='mark_demand',
            name='comment',
            field=models.CharField(max_length=500, blank=True, null=True),
        ),
        migrations.AddField(
            model_name='mark_demand',
            name='document_path',
            field=models.ForeignKey(null=True, related_name='path_demands', to='edms.Document_Path', on_delete=models.deletion.RESTRICT),
        ),
    ]
