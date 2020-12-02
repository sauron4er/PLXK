# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('docs', '0011_order_doc_author'),
    ]

    operations = [
        migrations.AddField(
            model_name='order_doc',
            name='responsible',
            field=models.ForeignKey(default=3, related_name='Responsible_for_documents', to=settings.AUTH_USER_MODEL, on_delete=models.deletion.RESTRICT),
            preserve_default=False,
        ),
    ]
