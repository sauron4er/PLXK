# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0015_userprofile_is_hr'),
        ('edms', '0035_document_is_active'),
    ]

    operations = [
        migrations.CreateModel(
            name='Decree',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('number', models.CharField(max_length=10)),
                ('name', models.CharField(max_length=500)),
                ('preamble', models.CharField(max_length=1000)),
                ('sign_date', models.DateField(null=True)),
                ('is_valid', models.BooleanField(default=True)),
                ('validity_start', models.DateTimeField(null=True)),
                ('validity_end', models.DateTimeField(null=True)),
                ('is_draft', models.BooleanField(default=False)),
                ('document', models.ForeignKey(related_name='decree_info', to='edms.Document', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.CreateModel(
            name='Doc_Approval',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('approved', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('approved_doc_path', models.ForeignKey(null=True, related_name='path_approval', to='edms.Document_Path', on_delete=models.deletion.RESTRICT)),
                ('document', models.ForeignKey(related_name='document_approves', to='edms.Document', on_delete=models.deletion.RESTRICT)),
                ('employee_seat', models.ForeignKey(related_name='employee_approvals', to='edms.Employee_Seat', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.CreateModel(
            name='Doc_Article',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('number', models.IntegerField()),
                ('text', models.CharField(max_length=1000)),
                ('deadline', models.DateTimeField(null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('document', models.ForeignKey(related_name='document_articles', to='edms.Document', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.CreateModel(
            name='Doc_Article_Dep',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('is_active', models.BooleanField(default=True)),
                ('article', models.ForeignKey(related_name='article_deps', to='edms.Doc_Article', on_delete=models.deletion.RESTRICT)),
                ('department', models.ForeignKey(blank=True, null=True, related_name='articles_to_response', to='accounts.Department', on_delete=models.deletion.RESTRICT)),
            ],
        ),
    ]
