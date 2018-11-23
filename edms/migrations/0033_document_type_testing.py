# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0032_file_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_type',
            name='testing',
            field=models.BooleanField(default=False),
        ),
    ]
