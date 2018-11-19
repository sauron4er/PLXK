# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0030_auto_20181109_1045'),
    ]

    operations = [
        migrations.RenameField(
            model_name='file',
            old_name='doc_file',
            new_name='file',
        ),
    ]
