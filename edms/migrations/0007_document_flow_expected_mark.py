# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0006_auto_20180702_0944'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_flow',
            name='expected_mark',
            field=models.ForeignKey(blank=True, null=True, related_name='in_flow', to='edms.Mark', on_delete=models.deletion.RESTRICT),
        ),
    ]
