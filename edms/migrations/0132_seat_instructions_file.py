# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0131_auto_20200724_1154'),
    ]

    operations = [
        migrations.AddField(
            model_name='seat',
            name='instructions_file',
            field=models.FileField(blank=True, null=True, upload_to='boards/org_structure/%Y/%m'),
        ),
    ]
