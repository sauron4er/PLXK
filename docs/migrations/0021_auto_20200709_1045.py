# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0020_auto_20200626_0918'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contract',
            name='basic_contract',
            field=models.ForeignKey(blank=True, null=True, related_name='additional_contracts', to='docs.Contract'),
        ),
        migrations.AlterField(
            model_name='contract',
            name='responsible',
            field=models.ForeignKey(blank=True, null=True, related_name='responsible_for_contracts', to=settings.AUTH_USER_MODEL),
        ),
    ]
