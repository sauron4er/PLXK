# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0115_auto_20191105_0934'),
    ]

    operations = [
        migrations.AlterField(
            model_name='vacation',
            name='acting',
            field=models.ForeignKey(null=True, related_name='acting', to='edms.Employee_Seat'),
        ),
    ]
