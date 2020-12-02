# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('docs', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ct',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('dt', models.DateTimeField(null=True, auto_now_add=True)),
                ('u', models.ForeignKey(related_name='+', to=settings.AUTH_USER_MODEL, on_delete=models.deletion.RESTRICT)),
            ],
        ),
    ]
