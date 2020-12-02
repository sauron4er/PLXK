# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0041_auto_20190211_1605'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='doc_approval',
            name='employee_seat',
        ),
        migrations.AddField(
            model_name='doc_approval',
            name='seat',
            field=models.ForeignKey(default=1, related_name='seat_approvals', to='edms.Seat', on_delete=models.deletion.RESTRICT),
            preserve_default=False,
        ),
    ]
