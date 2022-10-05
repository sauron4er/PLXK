# Generated by Django 3.1.13 on 2022-10-05 06:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('correspondence', '0021_auto_20210608_1155'),
    ]

    operations = [
        migrations.CreateModel(
            name='Corr_Templates',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('file', models.FileField(upload_to='correspondence/corr_templates/%Y/%m')),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
    ]
