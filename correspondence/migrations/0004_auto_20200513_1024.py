# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('correspondence', '0003_auto_20200513_1014'),
    ]

    operations = [
        migrations.AddField(
            model_name='request',
            name='last_updated_by',
            field=models.ForeignKey(blank=True, null=True, related_name='requests_updated', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='request',
            name='answer',
            field=models.CharField(max_length=5000, blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='request',
            name='law',
            field=models.ForeignKey(blank=True, null=True, related_name='requests', to='correspondence.Law'),
        ),
        migrations.AlterField(
            model_name='request',
            name='request_term',
            field=models.DateTimeField(null=True),
        ),
    ]
