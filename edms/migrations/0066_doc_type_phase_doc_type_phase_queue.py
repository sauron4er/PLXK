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
                ('document_type', models.ForeignKey(related_name='dtm_types', to='edms.Document_Type')),
                ('mark', models.ForeignKey(related_name='dtm_marks', to='edms.Mark')),
            ],
        ),
        migrations.CreateModel(
            name='Doc_Type_Phase_Queue',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('queue', models.IntegerField()),
                ('is_active', models.BooleanField(default=True)),
                ('employee', models.ForeignKey(null=True, related_name='phase_employee', to='accounts.UserProfile')),
                ('employee_seat', models.ForeignKey(null=True, related_name='phase_emp_seats', to='edms.Employee_Seat')),
                ('phase', models.ForeignKey(related_name='phases', to='edms.Doc_Type_Phase')),
                ('seat', models.ForeignKey(null=True, related_name='phase_seats', to='edms.Seat')),
            ],
        ),
    ]
