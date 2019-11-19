# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0118_vacation_started'),
    ]

    operations = [
        migrations.AlterField(
            model_name='document_path',
            name='comment',
            field=models.CharField(max_length=5000, blank=True),
        ),
    ]
