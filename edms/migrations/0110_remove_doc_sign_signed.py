# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0109_auto_20190919_1100'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='doc_sign',
            name='signed',
        ),
    ]
