# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('polls', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='User_Choice',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('choice', models.ForeignKey(on_delete=models.deletion.RESTRICT, to='polls.Choice')),
                ('employee', models.ForeignKey(null=True, related_name='+', to=settings.AUTH_USER_MODEL, on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.AddField(
            model_name='question',
            name='question_type',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='user_choice',
            name='question',
            field=models.ForeignKey(on_delete=models.deletion.RESTRICT, to='polls.Question'),
        ),
    ]
