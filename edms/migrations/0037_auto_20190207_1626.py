# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0036_decree_doc_approval_doc_article_doc_article_dep'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doc_article_dep',
            name='department',
            field=models.ForeignKey(default=1, related_name='articles_to_response', to='accounts.Department'),
            preserve_default=False,
        ),
    ]
