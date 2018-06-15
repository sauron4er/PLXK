# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Active_Docs_View',
            fields=[
                ('employee_id', models.IntegerField()),
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('date', models.CharField(max_length=100)),
                ('description', models.CharField(max_length=100)),
            ],
            options={
                'db_table': 'edms_active_docs',
                'managed': False,
            },
        ),
    ]
