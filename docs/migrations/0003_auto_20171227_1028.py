# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0002_ct'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ct',
            name='u',
            field=models.ForeignKey(blank=True, related_name='+', to=settings.AUTH_USER_MODEL),
        ),
    ]
