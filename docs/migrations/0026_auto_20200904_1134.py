# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0025_auto_20200806_1137'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order_doc',
            name='responsible',
            field=models.ForeignKey(blank=True, null=True, related_name='responsible_for_documents', to=settings.AUTH_USER_MODEL, on_delete=models.deletion.RESTRICT),
        ),
    ]
