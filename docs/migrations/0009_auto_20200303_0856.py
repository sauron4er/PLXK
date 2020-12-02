# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docs', '0008_document_actuality'),
    ]

    operations = [
        migrations.AddField(
            model_name='order_doc',
            name='canceled_by',
            field=models.ForeignKey(blank=True, null=True, related_name='cancels_order', to='docs.Order_doc', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AddField(
            model_name='order_doc',
            name='canceled_file',
            field=models.FileField(null=True, upload_to='order_docs/%Y/%m'),
        ),
        migrations.AddField(
            model_name='order_doc',
            name='cancels',
            field=models.ForeignKey(blank=True, null=True, related_name='cancelled_by_order', to='docs.Order_doc', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AddField(
            model_name='order_doc',
            name='date_canceled',
            field=models.DateField(null=True),
        ),
    ]
