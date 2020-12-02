# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0043_auto_20190213_1144'),
    ]

    operations = [
        migrations.CreateModel(
            name='Doc_Day',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('day', models.DateField(default=django.utils.timezone.now)),
                ('is_active', models.BooleanField(default=True)),
                ('document', models.ForeignKey(related_name='document_day', to='edms.Document', on_delete=models.deletion.RESTRICT)),
            ],
        ),
    ]
