# Generated by Django 3.1.14 on 2023-11-24 20:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0163_doc_type_phase_plus_approval_by_chief'),
        ('hr', '0003_auto_20220505_1456'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Seat_Instruction',
            new_name='Instruction',
        ),
    ]