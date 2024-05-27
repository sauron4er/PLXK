# Generated by Django 4.2.11 on 2024-05-27 21:11

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0042_userprofile_permissions_edit'),
        ('edms', '0166_document_type_module_columns_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Doc_Department',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_active', models.BooleanField(default=True)),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='documents', to='accounts.department')),
                ('document', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='departments', to='edms.document')),
            ],
        ),
    ]