# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0012_employee_seat_is_main'),
    ]

    operations = [
        migrations.CreateModel(
            name='Archive_Docs_View',
            fields=[
                ('employee_id', models.IntegerField()),
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('date', models.CharField(max_length=100)),
                ('description', models.CharField(max_length=100)),
                ('type_id', models.IntegerField()),
                ('employee_seat_id', models.IntegerField()),
            ],
            options={
                'db_table': 'edms_my_archive_docs',
                'managed': False,
            },
        ),
        migrations.AddField(
            model_name='carry_out_items',
            name='measurement',
            field=models.CharField(max_length=100, default=1),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='carry_out_items',
            name='quantity',
            field=models.CharField(max_length=100),
        ),
    ]
