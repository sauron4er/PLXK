# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0009_seat_free_time_chief'),
    ]

    operations = [
        migrations.RenameField(
            model_name='seat',
            old_name='free_time_chief',
            new_name='is_free_time_chief',
        ),
    ]
