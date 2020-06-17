# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0026_userprofile_is_correspondence_mail'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='clients_add',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='mockup_product_type_add',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='mockup_type_add',
            field=models.BooleanField(default=False),
        ),
    ]
