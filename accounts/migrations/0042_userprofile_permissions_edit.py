# Generated by Django 3.1.13 on 2023-03-13 07:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0041_vacation_finished'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='permissions_edit',
            field=models.BooleanField(default=False),
        ),
    ]
