# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0052_auto_20190318_0942'),
    ]

    operations = [
        migrations.CreateModel(
            name='Doc_Type_Unique_Number',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('number', models.IntegerField(null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('document', models.OneToOneField(related_name='document_number', to='edms.Document', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.RemoveField(
            model_name='doc_number',
            name='document',
        ),
        migrations.DeleteModel(
            name='Doc_Number',
        ),
    ]
