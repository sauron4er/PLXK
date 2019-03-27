# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0066_doc_type_phase_doc_type_phase_queue'),
    ]

    operations = [
        migrations.AddField(
            model_name='mark_demand',
            name='phase_id',
            field=models.ForeignKey(null=True, related_name='phase_mark_demands', to='edms.Doc_Type_Phase'),
        ),
    ]
