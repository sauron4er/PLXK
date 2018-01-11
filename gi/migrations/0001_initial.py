# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='News',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('title', models.CharField(max_length=200)),
                ('text', models.CharField(max_length=4000, blank=True, null=True)),
                ('date_start', models.DateTimeField(blank=True, null=True)),
                ('author', models.CharField(max_length=100, blank=True, null=True)),
                ('doc_file', models.FileField(blank=True, null=True, upload_to='news_file/%Y/%m')),
                ('img_file', models.ImageField(blank=True, null=True, upload_to='news_img/%Y/%m')),
                ('img_text', models.CharField(max_length=200, blank=True, null=True)),
            ],
        ),
    ]
