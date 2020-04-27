# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0024_userprofile_is_doc_order_add'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_correspondence_view',
            field=models.BooleanField(default=False),
        ),
    ]
