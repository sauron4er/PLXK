# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0039_auto_20190211_1132'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doc_article',
            name='deadline',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
