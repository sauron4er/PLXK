# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0045_auto_20190301_1336'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='doc_approval',
            name='declined',
        ),
        migrations.RemoveField(
            model_name='doc_approval',
            name='declined_path',
        ),
        migrations.AlterField(
            model_name='doc_approval',
            name='approved',
            field=models.NullBooleanField(),
        ),
    ]
