# Generated by Django 3.1.13 on 2022-05-05 11:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hr', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='department_regulation',
            name='number',
            field=models.CharField(max_length=12),
        ),
        migrations.AlterField(
            model_name='seat_instruction',
            name='number',
            field=models.CharField(max_length=12),
        ),
    ]