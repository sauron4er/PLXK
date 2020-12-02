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
            name='Doc_group',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('name', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Doc_type',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('name', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('name', models.CharField(max_length=500)),
                ('code', models.CharField(max_length=100, blank=True, null=True)),
                ('doc_file', models.FileField(upload_to='docs/%Y/%m')),
                ('act', models.CharField(max_length=50, blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('date_start', models.DateField(null=True)),
                ('date_fin', models.DateField(null=True)),
                ('author', models.CharField(max_length=100, blank=True, null=True)),
                ('responsible', models.CharField(max_length=100, blank=True, null=True)),
                ('created_by', models.ForeignKey(related_name='+', to=settings.AUTH_USER_MODEL, on_delete=models.deletion.RESTRICT)),
                ('doc_group', models.ForeignKey(related_name='Documents', on_delete=models.deletion.RESTRICT, to='docs.Doc_group')),
                ('doc_type', models.ForeignKey(related_name='Documents', on_delete=models.deletion.RESTRICT, to='docs.Doc_type')),
                ('updated_by', models.ForeignKey(blank=True, null=True, related_name='+', to=settings.AUTH_USER_MODEL, on_delete=models.deletion.RESTRICT)),
            ],
        ),
    ]
