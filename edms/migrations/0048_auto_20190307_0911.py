# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0047_seat_is_dep_chief'),
    ]

    operations = [
        migrations.CreateModel(
            name='Document_Type_Option',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('is_active', models.BooleanField(default=True)),
                ('document_type', models.ForeignKey(related_name='option_types', to='edms.Document_Type')),
            ],
        ),
        migrations.CreateModel(
            name='Option',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('option', models.CharField(max_length=10)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.AlterField(
            model_name='document_type_permission',
            name='mark',
            field=models.ForeignKey(related_name='permission_marks', to='edms.Mark'),
        ),
        migrations.AlterField(
            model_name='document_type_permission',
            name='seat',
            field=models.ForeignKey(related_name='permission_seats', to='edms.Seat'),
        ),
        migrations.AddField(
            model_name='document_type_option',
            name='option',
            field=models.ForeignKey(related_name='type_options', to='edms.Option'),
        ),
    ]
