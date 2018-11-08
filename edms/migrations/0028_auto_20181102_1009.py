# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0027_document_type_is_active'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='document_type_permission',
            name='mark_type',
        ),
        migrations.AddField(
            model_name='document_type_permission',
            name='mark',
            field=models.ForeignKey(default=2, related_name='type_permissions', to='edms.Mark'),
            preserve_default=False,
        ),
    ]
