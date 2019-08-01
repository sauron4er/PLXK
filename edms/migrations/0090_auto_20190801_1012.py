# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0089_auto_20190527_1138'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doc_text',
            name='text',
            field=models.CharField(max_length=5000, blank=True, null=True),
        ),
    ]
