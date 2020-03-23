# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('docs', '0003_auto_20171227_1028'),
    ]

    operations = [
        migrations.CreateModel(
            name='Order_doc',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('name', models.CharField(max_length=500)),
                ('code', models.CharField(max_length=100, blank=True, null=True)),
                ('doc_file', models.FileField(upload_to='order_docs/%Y/%m')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('date_start', models.DateField(null=True)),
                # ('author', models.CharField(max_length=100, blank=True, null=True)),
                # ('responsible', models.CharField(max_length=100, blank=True, null=True)),
                ('created_by', models.ForeignKey(related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Order_doc_type',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('name', models.CharField(max_length=100)),
            ],
        ),
        migrations.AddField(
            model_name='order_doc',
            name='doc_type',
            field=models.ForeignKey(related_name='Documents', on_delete='CASCADE', to='docs.Order_doc_type'),
        ),
        migrations.AddField(
            model_name='order_doc',
            name='updated_by',
            field=models.ForeignKey(blank=True, null=True, related_name='+', to=settings.AUTH_USER_MODEL),
        ),
    ]
