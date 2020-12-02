# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0106_auto_20190902_1126'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='deactivate_path',
            field=models.ForeignKey(null=True, related_name='deactivate_files', to='edms.Document_Path', on_delete=models.deletion.RESTRICT),
        ),
    ]
