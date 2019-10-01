# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0090_auto_20190801_1012'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_type_module',
            name='is_tiny_text_box',
            field=models.BooleanField(default=False),
        ),
    ]
