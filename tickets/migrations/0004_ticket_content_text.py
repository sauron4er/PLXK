# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0003_priority_ico'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticket_content',
            name='text',
            field=models.TextField(max_length=4000, blank=True),
        ),
    ]
