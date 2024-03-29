# Generated by Django 3.1.14 on 2023-12-03 15:06

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('boards', '0016_proposal'),
    ]

    operations = [
        migrations.CreateModel(
            name='Phone_External',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('owner', models.CharField(max_length=50)),
                ('number', models.CharField(max_length=15)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.AlterField(
            model_name='phones',
            name='name',
            field=models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='phones', to=settings.AUTH_USER_MODEL),
        ),
    ]
