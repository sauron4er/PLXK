# Generated by Django 3.1.13 on 2022-02-23 07:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0151_auto_20211021_0955'),
    ]

    operations = [
        migrations.AddField(
            model_name='document_type_module',
            name='defines_doc_version',
            field=models.BooleanField(default=False),
        ),
    ]
