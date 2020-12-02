# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('gi', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='news',
            name='author',
            field=models.ForeignKey(blank=True, null=True, related_name='+', to=settings.AUTH_USER_MODEL, on_delete=models.deletion.RESTRICT),
        ),
    ]
