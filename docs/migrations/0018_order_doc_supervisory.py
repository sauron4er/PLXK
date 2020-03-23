# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('docs', '0017_auto_20200317_1003'),
    ]

    operations = [
        migrations.AddField(
            model_name='order_doc',
            name='supervisory',
            field=models.ForeignKey(blank=True, null=True, related_name='Supervisory_for_documents', to=settings.AUTH_USER_MODEL),
        ),
    ]
