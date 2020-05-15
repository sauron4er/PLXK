# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('correspondence', '0002_auto_20200504_1647'),
    ]

    operations = [
        migrations.CreateModel(
            name='Request_file',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('file', models.FileField(upload_to='correspondence/request/%Y/%m')),
                ('name', models.CharField(max_length=100)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.RemoveField(
            model_name='request',
            name='request_file',
        ),
        migrations.AlterField(
            model_name='answer_file',
            name='file',
            field=models.FileField(upload_to='correspondence/answers/%Y/%m'),
        ),
        migrations.AddField(
            model_name='request_file',
            name='request',
            field=models.ForeignKey(related_name='request_files', to='correspondence.Request'),
        ),
    ]
