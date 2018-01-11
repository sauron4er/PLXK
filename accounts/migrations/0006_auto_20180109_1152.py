# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_auto_20171229_1358'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='mobile1',
            field=models.CharField(max_length=11, blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='mobile2',
            field=models.CharField(max_length=11, blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='n_main',
            field=models.CharField(max_length=4, blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='n_mobile',
            field=models.CharField(max_length=4, blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='n_out',
            field=models.CharField(max_length=11, blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='n_second',
            field=models.CharField(max_length=4, blank=True, null=True),
        ),
    ]
