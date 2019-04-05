# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0072_auto_20190327_0908'),
    ]

    operations = [
        migrations.AddField(
            model_name='doc_type_phase',
            name='required',
            field=models.BooleanField(default=True),
        ),
    ]
