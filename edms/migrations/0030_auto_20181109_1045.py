# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0029_auto_20181107_1119'),
    ]

    operations = [
        migrations.CreateModel(
            name='File',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('doc_file', models.FileField(upload_to='edms_files/%Y/%m')),
                ('document_path', models.ForeignKey(null=True, related_name='files', to='edms.Document_Path', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.RemoveField(
            model_name='document_flow',
            name='document',
        ),
        migrations.RemoveField(
            model_name='document_flow',
            name='employee_seat',
        ),
        migrations.RemoveField(
            model_name='document_flow',
            name='expected_mark',
        ),
        migrations.DeleteModel(
            name='Document_Flow',
        ),
    ]
