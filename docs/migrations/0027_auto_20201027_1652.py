# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0026_auto_20200904_1134'),
    ]

    operations = [
        migrations.CreateModel(
            name='Responsible_file',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('file', models.FileField(upload_to='order_docs/responsibles/%Y/%m')),
                ('name', models.CharField(max_length=100, blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.AddField(
            model_name='article_responsible',
            name='comment',
            field=models.CharField(max_length=500, blank=True, null=True),
        ),
        migrations.AddField(
            model_name='responsible_file',
            name='responsible',
            field=models.ForeignKey(null=True, related_name='files', to='docs.Article_responsible'),
        ),
    ]
