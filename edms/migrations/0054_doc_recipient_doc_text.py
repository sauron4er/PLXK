# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0053_auto_20190318_0958'),
    ]

    operations = [
        migrations.CreateModel(
            name='Doc_Recipient',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('is_active', models.BooleanField(default=True)),
                ('document', models.ForeignKey(related_name='doc_recipient', to='edms.Document', on_delete=models.deletion.RESTRICT)),
                ('recipient', models.ForeignKey(related_name='recipient_doc', to='edms.Employee_Seat', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.CreateModel(
            name='Doc_Text',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('text', models.CharField(max_length=1000, blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('document', models.OneToOneField(related_name='doc_text', to='edms.Document', on_delete=models.deletion.RESTRICT)),
            ],
        ),
    ]
