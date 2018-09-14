# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bets', '0010_auto_20180319_1109'),
    ]

    operations = [
        migrations.CreateModel(
            name='Rate',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('team1_rate', models.IntegerField(blank=True, null=True)),
                ('team2_rate', models.IntegerField(blank=True, null=True)),
                ('draw_rate', models.IntegerField(blank=True, null=True)),
                ('match', models.ForeignKey(blank=True, null=True, related_name='matches', on_delete='CASCADE', to='bets.Match')),
            ],
        ),
    ]
