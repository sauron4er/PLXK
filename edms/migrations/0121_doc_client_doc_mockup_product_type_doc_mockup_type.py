# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('correspondence', '0008_client_country'),
        ('production', '0001_initial'),
        ('edms', '0120_auto_20200115_0921'),
    ]

    operations = [
        migrations.CreateModel(
            name='Doc_client',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('is_active', models.BooleanField(default=True)),
                ('client', models.ForeignKey(related_name='client_documents', to='correspondence.Client', on_delete=models.deletion.RESTRICT)),
                ('document', models.ForeignKey(related_name='document_client', to='edms.Document', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.CreateModel(
            name='Doc_mockup_product_type',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('is_active', models.BooleanField(default=True)),
                ('document', models.ForeignKey(related_name='document_mockup_product_type', to='edms.Document', on_delete=models.deletion.RESTRICT)),
                ('mockup_product_type', models.ForeignKey(related_name='mpt_documents', to='production.Mockup_product_type', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.CreateModel(
            name='Doc_mockup_type',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('is_active', models.BooleanField(default=True)),
                ('document', models.ForeignKey(related_name='document_mockup_type', to='edms.Document', on_delete=models.deletion.RESTRICT)),
                ('mockup_type', models.ForeignKey(related_name='mt_documents', to='production.Mockup_type', on_delete=models.deletion.RESTRICT)),
            ],
        ),
    ]
