# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0024_auto_20181026_1038'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_type',
            name='creator_id',
            field=models.ForeignKey(null=True, related_name='creator', to='edms.Employee_Seat', on_delete=models.deletion.RESTRICT),
        ),
    ]
