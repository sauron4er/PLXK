# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0015_remove_carry_out_items_gate'),
    ]

    operations = [
        migrations.CreateModel(
            name='Carry_Out_Info',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('carry_out_day', models.DateField(default=django.utils.timezone.now)),
                ('gate', models.IntegerField(default=1)),
                ('document', models.ForeignKey(related_name='info_documents', to='edms.Document', on_delete=models.deletion.RESTRICT)),
            ],
        ),
    ]
