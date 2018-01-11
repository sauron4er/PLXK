# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0003_userprofile_is_ticked_admin'),
    ]

    operations = [
        migrations.AddField(
            model_name='department',
            name='manager',
            field=models.ForeignKey(blank=True, null=True, related_name='department_manager', on_delete='CASCADE', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='department',
            name='text',
            field=models.CharField(max_length=4000, blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='work',
            field=models.CharField(max_length=200, blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='department',
            field=models.ForeignKey(blank=True, null=True, default=1, related_name='+', on_delete='CASCADE', to='accounts.Department'),
        ),
    ]
