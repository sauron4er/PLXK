# Generated by Django 4.2.11 on 2024-05-04 03:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0167_doc_seat_doc_boolean'),
    ]

    operations = [
        migrations.RenameField(
            model_name='doc_boolean',
            old_name='boolean',
            new_name='checked',
        ),
    ]
