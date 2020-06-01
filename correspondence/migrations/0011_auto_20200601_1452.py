# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('correspondence', '0010_auto_20200601_1402'),
    ]

    operations = [
        migrations.CreateModel(
            name='Law_scope',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.RemoveField(
            model_name='law',
            name='scope',
        ),
        migrations.AlterField(
            model_name='request',
            name='scope',
            field=models.ForeignKey(related_name='requests', to='correspondence.Scope'),
        ),
        migrations.AddField(
            model_name='law_scope',
            name='law',
            field=models.ForeignKey(related_name='scopes', to='correspondence.Law'),
        ),
        migrations.AddField(
            model_name='law_scope',
            name='scope',
            field=models.ForeignKey(related_name='laws', to='correspondence.Scope'),
        ),
    ]
