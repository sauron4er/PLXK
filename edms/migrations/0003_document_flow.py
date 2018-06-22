# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0015_userprofile_is_hr'),
        ('edms', '0002_active_docs_view'),
    ]

    operations = [
        migrations.CreateModel(
            name='Document_Flow',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('document', models.ForeignKey(related_name='flow', to='edms.Document')),
                ('employee', models.ForeignKey(related_name='documents_in_flow', to='accounts.UserProfile')),
            ],
        ),
    ]
