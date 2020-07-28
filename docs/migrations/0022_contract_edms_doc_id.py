# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0129_auto_20200724_1046'),
        ('docs', '0021_auto_20200709_1045'),
    ]

    operations = [
        migrations.AddField(
            model_name='contract',
            name='edms_doc_id',
            field=models.ForeignKey(null=True, related_name='contracts', to='edms.Document'),
        ),
    ]
