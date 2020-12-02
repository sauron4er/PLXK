# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('correspondence', '0004_auto_20200513_1024'),
    ]

    operations = [
        migrations.CreateModel(
            name='Request_law',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('is_active', models.BooleanField(default=True)),
                ('law', models.ForeignKey(blank=True, null=True, related_name='requests', to='correspondence.Law', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.RemoveField(
            model_name='request',
            name='law',
        ),
        migrations.AddField(
            model_name='request_law',
            name='request',
            field=models.ForeignKey(related_name='request_laws', to='correspondence.Request', on_delete=models.deletion.RESTRICT),
        ),
    ]
