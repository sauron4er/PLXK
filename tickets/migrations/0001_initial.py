# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Group',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('name', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Priority',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('name', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='State',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('name', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('text', models.TextField(max_length=4000)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('group', models.ForeignKey(on_delete=models.deletion.RESTRICT, to='tickets.Group')),
                ('priority', models.ForeignKey(on_delete=models.deletion.RESTRICT, to='tickets.Priority')),
                ('responsible', models.ForeignKey(blank=True, related_name='ticketResponsible', on_delete=models.deletion.RESTRICT, to=settings.AUTH_USER_MODEL)),
                ('state', models.ForeignKey(on_delete=models.deletion.RESTRICT, to='tickets.State')),
                ('user', models.ForeignKey(related_name='ticket_user', on_delete=models.deletion.RESTRICT, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Ticket_content',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('dt', models.DateTimeField(auto_now_add=True)),
                ('state', models.ForeignKey(related_name='ticket_ct_state', on_delete=models.deletion.RESTRICT, to='tickets.State')),
                ('ticket', models.ForeignKey(related_name='ticket_ct_ticket', on_delete=models.deletion.RESTRICT, to='tickets.Ticket')),
                ('user', models.ForeignKey(related_name='ticket_content_user', on_delete=models.deletion.RESTRICT, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
