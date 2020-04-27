# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Answer_file',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('file', models.FileField(upload_to='correspondence/request_answers/%Y/%m')),
                ('name', models.CharField(max_length=100)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Client',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('name', models.CharField(max_length=100)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Law',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('name', models.CharField(max_length=200)),
                ('url', models.CharField(max_length=200)),
                ('is_actual', models.BooleanField(default=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Law_file',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('file', models.FileField(upload_to='correspondence/laws/%Y/%m')),
                ('name', models.CharField(max_length=100)),
                ('is_active', models.BooleanField(default=True)),
                ('law', models.ForeignKey(related_name='files', to='correspondence.Law')),
            ],
        ),
        migrations.CreateModel(
            name='Product_type',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('name', models.CharField(max_length=100)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Request',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('request_file', models.FileField(upload_to='correspondence/requests/%Y/%m')),
                ('request_date', models.DateTimeField()),
                ('request_term', models.DateTimeField()),
                ('answer', models.CharField(max_length=5000)),
                ('answer_date', models.DateTimeField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('added_by', models.ForeignKey(related_name='requests_added', to=settings.AUTH_USER_MODEL)),
                ('answer_responsible', models.ForeignKey(related_name='answer_responsible', to=settings.AUTH_USER_MODEL)),
                ('clients_name', models.ForeignKey(related_name='requests', to='correspondence.Client')),
                ('law', models.ForeignKey(related_name='requests', to='correspondence.Law')),
                ('product_type', models.ForeignKey(related_name='requests', to='correspondence.Product_type')),
                ('responsible', models.ForeignKey(related_name='responsible', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='answer_file',
            name='request',
            field=models.ForeignKey(related_name='answer_files', to='correspondence.Request'),
        ),
    ]
