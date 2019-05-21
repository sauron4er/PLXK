# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0021_auto_20190514_0933'),
        ('boards', '0005_add'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ad',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('ad', models.CharField(max_length=500)),
                ('is_active', models.BooleanField(default=True)),
                ('author', models.ForeignKey(related_name='ads', to='accounts.UserProfile')),
            ],
        ),
        migrations.RemoveField(
            model_name='add',
            name='author',
        ),
        migrations.DeleteModel(
            name='Add',
        ),
    ]
