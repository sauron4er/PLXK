# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0116_auto_20191105_1159'),
    ]

    operations = [
        migrations.AlterField(
            model_name='vacation',
            name='acting',
            field=models.ForeignKey(null=True, related_name='acting_for', to='accounts.UserProfile', on_delete=models.deletion.RESTRICT),
        ),
    ]
