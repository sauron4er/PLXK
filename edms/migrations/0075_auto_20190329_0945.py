# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0074_auto_20190329_0937'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mark_demand',
            name='phase',
            field=models.ForeignKey(default=1, related_name='md_phase', to='edms.Doc_Type_Phase', on_delete=models.deletion.RESTRICT),
            preserve_default=False,
        ),
    ]
