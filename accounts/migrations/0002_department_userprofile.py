# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Department',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('avatar', models.ImageField(verbose_name='Аватар', upload_to='images/users')),
                ('department', models.ForeignKey(blank=True, default=1, related_name='+', on_delete=models.deletion.RESTRICT, to='accounts.Department')),
                ('user', models.OneToOneField(to=settings.AUTH_USER_MODEL, on_delete=models.deletion.RESTRICT)),
            ],
            options={
                'verbose_name': 'Профіль',
                'verbose_name_plural': 'Профілі',
            },
        ),
    ]
