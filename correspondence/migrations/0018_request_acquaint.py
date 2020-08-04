# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('correspondence', '0017_request_type'),
    ]

    operations = [
        migrations.CreateModel(
            name='Request_acquaint',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('is_active', models.BooleanField(default=True)),
                ('acquaint', models.ForeignKey(related_name='requests_acquaint', to=settings.AUTH_USER_MODEL)),
                ('request', models.ForeignKey(related_name='acquaints', to='correspondence.Request')),
            ],
        ),
    ]
