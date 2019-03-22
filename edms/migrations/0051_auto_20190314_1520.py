# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0050_auto_20190313_1006'),
    ]

    operations = [
        migrations.CreateModel(
            name='Document_Type_Module',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('is_active', models.BooleanField(default=True)),
                ('document_type', models.ForeignKey(related_name='module_types', to='edms.Document_Type')),
            ],
        ),
        migrations.CreateModel(
            name='Module',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('module', models.CharField(max_length=50)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.AddField(
            model_name='document_type_module',
            name='module',
            field=models.ForeignKey(related_name='type_modules', to='edms.Module'),
        ),
    ]
