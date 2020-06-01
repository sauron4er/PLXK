# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0121_doc_client_doc_mockup_product_type_doc_mockup_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_type',
            name='is_changeable',
            field=models.BooleanField(default=False),
        ),
    ]
