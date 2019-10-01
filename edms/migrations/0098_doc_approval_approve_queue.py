# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0097_auto_20190812_0853'),
    ]

    operations = [
        migrations.AddField(
            model_name='doc_approval',
            name='approve_queue',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
