# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('correspondence', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='request',
            old_name='clients_name',
            new_name='client',
        ),
    ]
