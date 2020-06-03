# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0125_document_type_module_table_view'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doc_acquaint',
            name='document',
            field=models.ForeignKey(related_name='acquaint_list', to='edms.Document'),
        ),
        migrations.AlterField(
            model_name='doc_approval',
            name='document',
            field=models.ForeignKey(related_name='approval_list', to='edms.Document'),
        ),
        migrations.AlterField(
            model_name='doc_client',
            name='document',
            field=models.ForeignKey(related_name='client', to='edms.Document'),
        ),
        migrations.AlterField(
            model_name='doc_day',
            name='document',
            field=models.ForeignKey(related_name='day', to='edms.Document'),
        ),
        migrations.AlterField(
            model_name='doc_gate',
            name='document',
            field=models.ForeignKey(related_name='gate', to='edms.Document'),
        ),
        migrations.AlterField(
            model_name='doc_mockup_product_type',
            name='document',
            field=models.ForeignKey(related_name='mockup_product_type', to='edms.Document'),
        ),
        migrations.AlterField(
            model_name='doc_mockup_type',
            name='document',
            field=models.ForeignKey(related_name='mockup_type', to='edms.Document'),
        ),
        migrations.AlterField(
            model_name='doc_mockup_type',
            name='mockup_type',
            field=models.ForeignKey(related_name='documents', to='production.Mockup_type'),
        ),
        migrations.AlterField(
            model_name='doc_recipient',
            name='document',
            field=models.ForeignKey(related_name='recipients', to='edms.Document'),
        ),
        migrations.AlterField(
            model_name='doc_text',
            name='document',
            field=models.ForeignKey(related_name='texts', to='edms.Document'),
        ),
    ]
