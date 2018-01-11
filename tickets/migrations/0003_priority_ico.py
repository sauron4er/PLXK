# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0002_ticket_doc_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='priority',
            name='ico',
            field=models.ImageField(blank=True, upload_to='images/ico'),
        ),
    ]
