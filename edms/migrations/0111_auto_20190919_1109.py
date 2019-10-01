# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0110_remove_doc_sign_signed'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doc_sign',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
