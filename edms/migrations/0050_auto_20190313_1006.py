# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0049_auto_20190307_0943'),
    ]

    operations = [
        migrations.CreateModel(
            name='Doc_Name',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('name', models.CharField(max_length=500)),
                ('is_active', models.BooleanField(default=True)),
                ('document', models.OneToOneField(related_name='document_name', to='edms.Document')),
            ],
        ),
        migrations.CreateModel(
            name='Doc_Number',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('number', models.IntegerField(null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('document', models.OneToOneField(related_name='document_number', to='edms.Document')),
            ],
        ),
        migrations.CreateModel(
            name='Doc_Preamble',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('preamble', models.CharField(max_length=1000)),
                ('is_active', models.BooleanField(default=True)),
                ('document', models.OneToOneField(related_name='document_preamble', to='edms.Document')),
            ],
        ),
        migrations.CreateModel(
            name='Doc_Sign',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('signed', models.BooleanField(default=True)),
                ('document', models.OneToOneField(related_name='document_sign', to='edms.Document')),
                ('sign_path', models.ForeignKey(null=True, related_name='path_sign', to='edms.Document_Path')),
            ],
        ),
        migrations.CreateModel(
            name='Doc_Validity',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('is_valid', models.BooleanField(default=True)),
                ('validity_start', models.DateTimeField(null=True)),
                ('validity_end', models.DateTimeField(null=True)),
                ('document', models.OneToOneField(related_name='document_validity', to='edms.Document')),
            ],
        ),
        migrations.AlterField(
            model_name='doc_approval',
            name='document',
            field=models.ForeignKey(related_name='document_approvals', to='edms.Document'),
        ),
    ]
