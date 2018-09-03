# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0014_carry_out_items_gate'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='carry_out_items',
            name='gate',
        ),
    ]
