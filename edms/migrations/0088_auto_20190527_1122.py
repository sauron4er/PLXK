# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0087_doc_type_phase_is_approve_chained'),
    ]

    operations = [
        migrations.CreateModel(
            name='Doc_Acquaint',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('is_active', models.BooleanField(default=True)),
                ('document', models.ForeignKey(related_name='document_acquaint_list', to='edms.Document', on_delete=models.deletion.RESTRICT)),
                ('employee_seat', models.ForeignKey(related_name='emp_seat_acquaints', to='edms.Employee_Seat', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.RemoveField(
            model_name='doc_approval',
            name='seat',
        ),
        migrations.AddField(
            model_name='doc_approval',
            name='employee_seat',
            field=models.ForeignKey(default=1, related_name='emp_seat_approvals', to='edms.Employee_Seat', on_delete=models.deletion.RESTRICT),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='doc_approval',
            name='approved_path',
            field=models.ForeignKey(null=True, related_name='path_approvals', to='edms.Document_Path', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AlterField(
            model_name='doc_approval',
            name='document',
            field=models.ForeignKey(related_name='document_approval_list', to='edms.Document', on_delete=models.deletion.RESTRICT),
        ),
    ]
