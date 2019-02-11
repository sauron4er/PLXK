# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0040_auto_20190211_1153'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doc_article',
            name='number',
            field=models.IntegerField(null=True),
        ),
    ]
