# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0128_doc_day_queue_in_doc'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doc_day',
            name='queue_in_doc',
            field=models.IntegerField(),
        ),
    ]
