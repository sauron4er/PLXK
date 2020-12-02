# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0015_userprofile_is_hr'),
        ('edms', '0065_auto_20190322_1201'),
    ]

    operations = [
        migrations.CreateModel(
            name='Doc_Type_Phase',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('queue', models.IntegerField()),
                ('is_active', models.BooleanField(default=True)),
                ('document_type', models.ForeignKey(related_name='dtm_types', to='edms.Document_Type', on_delete=models.deletion.RESTRICT)),
                ('mark', models.ForeignKey(related_name='dtm_marks', to='edms.Mark', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.CreateModel(
            name='Doc_Type_Phase_Queue',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('queue', models.IntegerField()),
                ('is_active', models.BooleanField(default=True)),
                ('employee', models.ForeignKey(null=True, related_name='phase_employee', to='accounts.UserProfile', on_delete=models.deletion.RESTRICT)),
                ('employee_seat', models.ForeignKey(null=True, related_name='phase_emp_seats', to='edms.Employee_Seat', on_delete=models.deletion.RESTRICT)),
                ('phase', models.ForeignKey(related_name='phases', to='edms.Doc_Type_Phase', on_delete=models.deletion.RESTRICT)),
                ('seat', models.ForeignKey(null=True, related_name='phase_seats', to='edms.Seat', on_delete=models.deletion.RESTRICT)),
            ],
        ),
    ]
