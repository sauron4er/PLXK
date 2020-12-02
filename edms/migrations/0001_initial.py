# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0015_userprofile_is_hr'),
    ]

    operations = [
        migrations.CreateModel(
            name='Carry_Out_Items',
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
                ('title', models.CharField(max_length=100, blank=True, null=True)),
                ('text', models.CharField(max_length=1000, blank=True, null=True)),
                ('image', models.BinaryField(null=True)),
                ('closed', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Document_Path',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('comment', models.CharField(max_length=200, blank=True)),
                ('document', models.ForeignKey(related_name='path', to='edms.Document', on_delete=models.deletion.RESTRICT)),
                ('employee', models.ForeignKey(related_name='documents', to='accounts.UserProfile', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.CreateModel(
            name='Document_Permission',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('is_active', models.BooleanField(default=True)),
                ('document', models.ForeignKey(related_name='with_permissions', to='edms.Document', on_delete=models.deletion.RESTRICT)),
                ('employee', models.ForeignKey(related_name='doc_permissions', to='accounts.UserProfile', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.CreateModel(
            name='Document_Type',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('document_type', models.CharField(max_length=50)),
                ('description', models.CharField(max_length=1000)),
            ],
        ),
        migrations.CreateModel(
            name='Document_Type_Permission',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('is_active', models.BooleanField(default=True)),
                ('document_type', models.ForeignKey(related_name='with_permissions', to='edms.Document_Type', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.CreateModel(
            name='Employee_Seat',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('begin_date', models.DateField(blank=True, null=True, default=django.utils.timezone.now)),
                ('end_date', models.DateField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('employee', models.ForeignKey(related_name='positions', to='accounts.UserProfile', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.CreateModel(
            name='Free_Time_Periods',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('free_day', models.DateField(default=django.utils.timezone.now)),
                ('begin_time', models.TimeField(blank=True, null=True)),
                ('end_time', models.TimeField(blank=True, null=True)),
                ('document', models.ForeignKey(related_name='free_documents', to='edms.Document', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.CreateModel(
            name='Mark',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('mark', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Mark_Demand',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('deadline', models.DateTimeField(null=True)),
                ('done', models.BooleanField(default=False)),
                ('timestamp', models.DateTimeField(null=True)),
                ('document', models.ForeignKey(related_name='documents_with_demand', to='edms.Document', on_delete=models.deletion.RESTRICT)),
                ('employee_control', models.ForeignKey(related_name='demands_controled', to='accounts.UserProfile', on_delete=models.deletion.RESTRICT)),
                ('employee_to_mark', models.ForeignKey(related_name='demands_to_do', to='accounts.UserProfile', on_delete=models.deletion.RESTRICT)),
                ('mark', models.ForeignKey(related_name='demands', to='edms.Mark', on_delete=models.deletion.RESTRICT)),
                ('result_document', models.ForeignKey(null=True, related_name='result_document', to='edms.Document', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.CreateModel(
            name='Seat',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('seat', models.CharField(max_length=100)),
                ('is_active', models.BooleanField(default=True)),
                ('chief', models.ForeignKey(blank=True, null=True, related_name='subordinate', to='edms.Seat', on_delete=models.deletion.RESTRICT)),
                ('department', models.ForeignKey(blank=True, null=True, related_name='positions', to='accounts.Department', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.CreateModel(
            name='Vacation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('begin_date', models.DateField(default=django.utils.timezone.now)),
                ('end_date', models.DateField(null=True)),
                ('acting', models.ForeignKey(null=True, related_name='acting_for', to='edms.Vacation', on_delete=models.deletion.RESTRICT)),
                ('employee', models.ForeignKey(related_name='vacations', to='accounts.UserProfile', on_delete=models.deletion.RESTRICT)),
            ],
        ),
        migrations.AddField(
            model_name='employee_seat',
            name='seat',
            field=models.ForeignKey(related_name='employees', to='edms.Seat', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AddField(
            model_name='document_type_permission',
            name='mark_type',
            field=models.ForeignKey(related_name='type_permissions', to='edms.Mark', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AddField(
            model_name='document_type_permission',
            name='seat',
            field=models.ForeignKey(related_name='type_permissions', to='edms.Seat', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AddField(
            model_name='document_permission',
            name='mark_type',
            field=models.ForeignKey(related_name='doc_permissions', to='edms.Mark', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AddField(
            model_name='document_path',
            name='mark',
            field=models.ForeignKey(related_name='documents_path', to='edms.Mark', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AddField(
            model_name='document',
            name='document_type',
            field=models.ForeignKey(related_name='type', to='edms.Document_Type', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AddField(
            model_name='document',
            name='employee',
            field=models.ForeignKey(related_name='initiated_documents', to='accounts.UserProfile', on_delete=models.deletion.RESTRICT),
        ),
        migrations.AddField(
            model_name='carry_out_items',
            name='document',
            field=models.ForeignKey(related_name='carry_documents', to='edms.Document', on_delete=models.deletion.RESTRICT),
        ),
    ]
