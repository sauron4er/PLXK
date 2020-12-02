# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0131_auto_20200724_1154'),
        ('docs', '0023_auto_20200724_1048'),
    ]

    operations = [
        migrations.CreateModel(
            name='Article_responsible',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('done', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Order_article',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('text', models.CharField(max_length=5000)),
                ('deadline', models.DateField(blank=True, null=True)),
                ('done', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.AddField(
            model_name='order_doc',
            name='done',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='order_article',
            name='order',
            field=models.ForeignKey(related_name='articles', to='docs.Order_doc', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AddField(
            model_name='article_responsible',
            name='article',
            field=models.ForeignKey(related_name='responsibles', to='docs.Order_article', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AddField(
            model_name='article_responsible',
            name='employee_seat',
            field=models.ForeignKey(related_name='orders_responsible', to='edms.Employee_Seat', on_delete=models.deletion.RESTRICT),
        ),
    ]
