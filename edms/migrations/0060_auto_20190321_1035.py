# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0059_auto_20190320_1133'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doc_name',
            name='document',
            field=models.ForeignKey(related_name='document_name', to='edms.Document', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AlterField(
            model_name='doc_preamble',
            name='document',
            field=models.ForeignKey(related_name='document_preamble', to='edms.Document', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AlterField(
            model_name='doc_sign',
            name='document',
            field=models.ForeignKey(related_name='document_sign', to='edms.Document', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AlterField(
            model_name='doc_text',
            name='document',
            field=models.ForeignKey(related_name='doc_text', to='edms.Document', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AlterField(
            model_name='doc_type_unique_number',
            name='document',
            field=models.ForeignKey(related_name='document_number', to='edms.Document', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AlterField(
            model_name='doc_validity',
            name='document',
            field=models.ForeignKey(related_name='document_validity', to='edms.Document', on_delete=models.deletion.RESTRICT),
        ),
    ]
