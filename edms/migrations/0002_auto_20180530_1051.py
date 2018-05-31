# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='seat',
            name='chief',
            field=models.ForeignKey(blank=True, null=True, related_name='subordinate', to='edms.Seat'),
        ),
        migrations.AlterField(
            model_name='seat',
            name='department',
            field=models.ForeignKey(blank=True, null=True, related_name='positions', to='accounts.Department'),
        ),
    ]
