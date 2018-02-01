# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('gi', '0005_country'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Bet',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('team1_bet', models.ImageField(blank=True, null=True, upload_to='')),
                ('team2_bet', models.ImageField(blank=True, null=True, upload_to='')),
            ],
        ),
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('dt', models.DateTimeField(blank=True, null=True)),
                ('team1_result', models.ImageField(blank=True, null=True, upload_to='')),
                ('team2_result', models.ImageField(blank=True, null=True, upload_to='')),
                ('status', models.ImageField(blank=True, null=True, default=0, upload_to='')),
            ],
        ),
        migrations.CreateModel(
            name='Season',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('name', models.CharField(max_length=200)),
                ('season_begin', models.DateField(blank=True, null=True)),
                ('season_end', models.DateField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Team',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('name', models.CharField(max_length=200)),
                ('country', models.ForeignKey(blank=True, null=True, related_name='country', on_delete='CASCADE', to='gi.Country')),
            ],
        ),
        migrations.CreateModel(
            name='Team_in_season',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('group', models.CharField(max_length=200)),
                ('initial_place', models.ImageField(null=True, default=0, upload_to='')),
                ('season', models.ForeignKey(blank=True, null=True, related_name='season', on_delete='CASCADE', to='bets.Season')),
                ('team', models.ForeignKey(blank=True, null=True, related_name='team', on_delete='CASCADE', to='bets.Team')),
            ],
        ),
        migrations.AddField(
            model_name='match',
            name='team1',
            field=models.ForeignKey(blank=True, null=True, related_name='team1', on_delete='CASCADE', to='bets.Team'),
        ),
        migrations.AddField(
            model_name='match',
            name='team2',
            field=models.ForeignKey(blank=True, null=True, related_name='team2', on_delete='CASCADE', to='bets.Team'),
        ),
        migrations.AddField(
            model_name='bet',
            name='match',
            field=models.ForeignKey(blank=True, null=True, related_name='match', on_delete='CASCADE', to='bets.Match'),
        ),
        migrations.AddField(
            model_name='bet',
            name='player',
            field=models.ForeignKey(related_name='+', to=settings.AUTH_USER_MODEL),
        ),
    ]
