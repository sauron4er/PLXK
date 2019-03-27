# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0071_remove_document_path_phases_testing'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mark_demand',
            name='phase',
            field=models.IntegerField(null=True),
        ),
    ]
