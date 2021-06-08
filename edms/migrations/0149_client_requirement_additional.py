# Generated by Django 3.1.4 on 2021-06-03 07:33

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0148_client_requirements_binding'),
    ]

    operations = [
        migrations.CreateModel(
            name='Client_Requirement_Additional',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=200, null=True)),
                ('requirement', models.CharField(blank=True, max_length=50, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('client_requirements', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='additional_requirements', to='edms.client_requirements')),
            ],
        ),
    ]
