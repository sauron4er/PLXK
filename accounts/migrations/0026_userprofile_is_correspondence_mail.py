# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0025_userprofile_is_correspondence_view'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_correspondence_mail',
            field=models.BooleanField(default=False),
        ),
    ]
