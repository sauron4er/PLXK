# Generated by Django 4.2.11 on 2024-06-01 03:18

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0042_userprofile_permissions_edit'),
        ('edms', '0165_bag_test_bag_test_file_bag_test_comment'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_type_module',
            name='columns',
            field=models.CharField(max_length=2, null=True),
        ),
        migrations.AlterField(
            model_name='document_type_module',
            name='additional_info',
            field=models.CharField(max_length=500, null=True),
        ),
        migrations.CreateModel(
            name='Doc_Seat',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_active', models.BooleanField(default=True)),
                ('document', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='seats', to='edms.document')),
                ('seat', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='documents', to='edms.seat')),
            ],
        ),
        migrations.CreateModel(
            name='Doc_Department',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_active', models.BooleanField(default=True)),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='documents', to='accounts.department')),
                ('document', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='departments', to='edms.document')),
            ],
        ),
        migrations.CreateModel(
            name='Doc_Boolean',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('checked', models.BooleanField(default=False)),
                ('queue_in_doc', models.IntegerField()),
                ('is_active', models.BooleanField(default=True)),
                ('document', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='booleans', to='edms.document')),
            ],
        ),
    ]
