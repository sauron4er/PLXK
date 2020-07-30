# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('correspondence', '0016_request_author_comment'),
    ]

    operations = [
        migrations.AddField(
            model_name='request',
            name='type',
            field=models.SmallIntegerField(default=1),
            preserve_default=False,
        ),
    ]
