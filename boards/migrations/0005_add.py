# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0021_auto_20190514_0933'),
        ('boards', '0004_auto_20180109_1152'),
    ]

    operations = [
        migrations.CreateModel(
            name='Add',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('add', models.CharField(max_length=500)),
                ('is_active', models.BooleanField(default=True)),
                ('author', models.ForeignKey(related_name='ads', to='accounts.UserProfile')),
            ],
        ),
    ]
