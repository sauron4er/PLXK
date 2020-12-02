# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('docs', '0010_auto_20200306_1323'),
    ]

    operations = [
        migrations.AddField(
            model_name='order_doc',
            name='author',
            field=models.ForeignKey(default=86, related_name='Created_documents', to=settings.AUTH_USER_MODEL, on_delete=models.deletion.RESTRICT),
            preserve_default=False,
        ),
    ]
