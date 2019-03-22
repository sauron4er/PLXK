# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0051_auto_20190314_1520'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='document_type_option',
            name='document_type',
        ),
        migrations.RemoveField(
            model_name='document_type_option',
            name='option',
        ),
        migrations.AddField(
            model_name='document_type_module',
            name='queue',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.DeleteModel(
            name='Document_Type_Option',
        ),
        migrations.DeleteModel(
            name='Option',
        ),
    ]
