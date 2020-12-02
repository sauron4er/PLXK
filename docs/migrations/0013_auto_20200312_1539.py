# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0012_order_doc_responsible'),
    ]

    operations = [
        migrations.CreateModel(
            name='File',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('file', models.FileField(upload_to='order_docs/%Y/%m')),
                ('name', models.CharField(max_length=100, blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.RemoveField(
            model_name='order_doc',
            name='doc_file',
        ),
        migrations.AddField(
            model_name='file',
            name='order',
            field=models.ForeignKey(null=True, related_name='files', to='docs.Order_doc', on_delete=models.deletion.RESTRICT),
        ),
    ]
