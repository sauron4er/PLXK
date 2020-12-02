# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0130_document_type_module_field'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doc_day',
            name='document',
            field=models.ForeignKey(related_name='days', to='edms.Document', on_delete=models.deletion.RESTRICT),
        ),
    ]
