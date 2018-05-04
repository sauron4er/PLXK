# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0011_userprofile_is_bets'),
    ]

    operations = [
        migrations.CreateModel(
            name='CarryOutItems',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('item_name', models.CharField(max_length=100)),
                ('quantity', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('title', models.CharField(max_length=100)),
                ('text', models.CharField(max_length=1000)),
                ('image', models.BinaryField(null=True)),
                ('closed', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='DocumentPath',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('comment', models.CharField(max_length=200, blank=True)),
                ('document_id', models.ForeignKey(related_name='document_path_doc', to='edms.Document')),
                ('employee_id', models.ForeignKey(related_name='document_path_employee', to='accounts.UserProfile')),
            ],
        ),
        migrations.CreateModel(
            name='DocumentPermission',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('actual', models.BooleanField(default=True)),
                ('document_id', models.ForeignKey(related_name='document_permission_doc', to='edms.Document')),
                ('employee_id', models.ForeignKey(related_name='doc_permissions_employee', to='accounts.UserProfile')),
            ],
        ),
        migrations.CreateModel(
            name='DocumentType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('document_type', models.CharField(max_length=50)),
                ('description', models.CharField(max_length=1000)),
            ],
        ),
        migrations.CreateModel(
            name='DocumentTypePermission',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('actual', models.BooleanField(default=True)),
                ('document_type_id', models.ForeignKey(related_name='type_permissions_document_type', to='edms.DocumentType')),
            ],
        ),
        migrations.CreateModel(
            name='EmployeePosition',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('begin_date', models.DateField(default=django.utils.timezone.now)),
                ('end_date', models.DateField(null=True)),
                ('employee_id', models.ForeignKey(related_name='employee', to='accounts.UserProfile')),
            ],
        ),
        migrations.CreateModel(
            name='FreeTimePeriods',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('free_day', models.DateField(default=django.utils.timezone.now)),
                ('begin_time', models.TimeField(default=django.utils.timezone.now)),
                ('end_time', models.TimeField(default='17.00')),
                ('document_id', models.ForeignKey(related_name='free_time_doc', to='edms.Document')),
            ],
        ),
        migrations.CreateModel(
            name='MarkDemand',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('deadline', models.DateTimeField(null=True)),
                ('done', models.BooleanField(default=False)),
                ('timestamp', models.DateTimeField(null=True)),
                ('document_id', models.ForeignKey(related_name='document', to='edms.Document')),
                ('employee_control_id', models.ForeignKey(related_name='employee_control', to='accounts.UserProfile')),
                ('employee_to_mark_id', models.ForeignKey(related_name='employee_to_mark', to='accounts.UserProfile')),
            ],
        ),
        migrations.CreateModel(
            name='MarkType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('mark_type', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Position',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('position', models.CharField(max_length=100)),
                ('actual', models.BooleanField(default=True)),
                ('chief_id', models.ForeignKey(null=True, related_name='chief', to='edms.Position')),
                ('department_id', models.ForeignKey(related_name='department', to='accounts.Department')),
            ],
        ),
        migrations.CreateModel(
            name='Vacation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('begin_date', models.DateField(default=django.utils.timezone.now)),
                ('end_date', models.DateField(null=True)),
                ('acting_id', models.ForeignKey(null=True, related_name='acting', to='edms.Vacation')),
                ('employee_id', models.ForeignKey(related_name='vacation_employee', to='accounts.UserProfile')),
            ],
        ),
        migrations.AddField(
            model_name='markdemand',
            name='mark_id',
            field=models.ForeignKey(related_name='mark_demand_mark', to='edms.MarkType'),
        ),
        migrations.AddField(
            model_name='markdemand',
            name='result_document_id',
            field=models.ForeignKey(null=True, related_name='result_document', to='edms.Document'),
        ),
        migrations.AddField(
            model_name='employeeposition',
            name='position_id',
            field=models.ForeignKey(related_name='employee_position', to='edms.Position'),
        ),
        migrations.AddField(
            model_name='documenttypepermission',
            name='mark_type_id',
            field=models.ForeignKey(related_name='type_permissions_mark', to='edms.MarkType'),
        ),
        migrations.AddField(
            model_name='documenttypepermission',
            name='position_id',
            field=models.ForeignKey(related_name='type_permissions_position', to='edms.Position'),
        ),
        migrations.AddField(
            model_name='documentpermission',
            name='mark_type_id',
            field=models.ForeignKey(related_name='doc_permissions_mark', to='edms.MarkType'),
        ),
        migrations.AddField(
            model_name='documentpath',
            name='mark_id',
            field=models.ForeignKey(related_name='document_path_mark', to='edms.MarkType'),
        ),
        migrations.AddField(
            model_name='document',
            name='document_type_id',
            field=models.ForeignKey(related_name='type', to='edms.DocumentType'),
        ),
        migrations.AddField(
            model_name='carryoutitems',
            name='document_id',
            field=models.ForeignKey(related_name='carry_out_doc', to='edms.Document'),
        ),
    ]
