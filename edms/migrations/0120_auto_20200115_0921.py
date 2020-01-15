# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0119_auto_20191119_1155'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='doc_article',
            name='document',
        ),
        migrations.RemoveField(
            model_name='doc_article_dep',
            name='article',
        ),
        migrations.RemoveField(
            model_name='doc_article_dep',
            name='department',
        ),
        migrations.RemoveField(
            model_name='doc_name',
            name='document',
        ),
        migrations.RemoveField(
            model_name='doc_sign',
            name='document',
        ),
        migrations.RemoveField(
            model_name='doc_sign',
            name='signed_path',
        ),
        migrations.RemoveField(
            model_name='doc_type_unique_number',
            name='document',
        ),
        migrations.RemoveField(
            model_name='doc_validity',
            name='document',
        ),
        migrations.RemoveField(
            model_name='document_permission',
            name='document',
        ),
        migrations.RemoveField(
            model_name='document_permission',
            name='employee',
        ),
        migrations.RemoveField(
            model_name='document_permission',
            name='mark_type',
        ),
        migrations.RemoveField(
            model_name='document_type_permission',
            name='document_type',
        ),
        migrations.RemoveField(
            model_name='document_type_permission',
            name='mark',
        ),
        migrations.RemoveField(
            model_name='document_type_permission',
            name='seat',
        ),
        migrations.DeleteModel(
            name='Doc_Article',
        ),
        migrations.DeleteModel(
            name='Doc_Article_Dep',
        ),
        migrations.DeleteModel(
            name='Doc_Name',
        ),
        migrations.DeleteModel(
            name='Doc_Sign',
        ),
        migrations.DeleteModel(
            name='Doc_Type_Unique_Number',
        ),
        migrations.DeleteModel(
            name='Doc_Validity',
        ),
        migrations.DeleteModel(
            name='Document_Permission',
        ),
        migrations.DeleteModel(
            name='Document_Type_Permission',
        ),
    ]
