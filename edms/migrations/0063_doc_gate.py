# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0062_auto_20190321_1648'),
    ]

    operations = [
        migrations.CreateModel(
            name='Doc_Gate',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('gate', models.IntegerField(default=1)),
                ('is_active', models.BooleanField(default=True)),
                ('document', models.ForeignKey(related_name='document_gate', to='edms.Document', on_delete=models.deletion.RESTRICT)),
            ],
        ),
    ]
