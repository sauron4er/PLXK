# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0027_auto_20200615_1631'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('docs', '0019_auto_20200521_1200'),
    ]

    operations = [
        migrations.CreateModel(
            name='Contract',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('number', models.CharField(max_length=10)),
                ('subject', models.CharField(max_length=1000)),
                ('counterparty', models.CharField(max_length=200)),
                ('nomenclature_group', models.CharField(max_length=100, blank=True, null=True)),
                ('date_start', models.DateField(blank=True, null=True)),
                ('date_end', models.DateField(blank=True, null=True)),
                ('lawyers_received', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('basic_contract', models.ForeignKey(blank=True, null=True, related_name='additional_agreements', to='docs.Contract')),
                ('created_by', models.ForeignKey(related_name='added_contracts', to=settings.AUTH_USER_MODEL)),
                ('department', models.ForeignKey(blank=True, null=True, related_name='contracts', to='accounts.Department')),
                ('responsible', models.ForeignKey(related_name='responsible_for_contracts', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(blank=True, null=True, related_name='updated_contracts', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Contract_File',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('file', models.FileField(upload_to='contract_docs/%Y/%m')),
                ('name', models.CharField(max_length=100, blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('contract', models.ForeignKey(null=True, related_name='files', to='docs.Contract')),
            ],
        ),
        migrations.AlterField(
            model_name='order_doc',
            name='created_by',
            field=models.ForeignKey(related_name='added_orders', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='order_doc',
            name='updated_by',
            field=models.ForeignKey(blank=True, null=True, related_name='updated_orders', to=settings.AUTH_USER_MODEL),
        ),
    ]
