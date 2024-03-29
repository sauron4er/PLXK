# Generated by Django 3.1.14 on 2023-09-18 03:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0042_userprofile_permissions_edit'),
        ('boards', '0015_client_bag_scheme'),
    ]

    operations = [
        migrations.CreateModel(
            name='Proposal',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('incident', models.CharField(max_length=5000, null=True)),
                ('incident_date', models.DateField(null=True)),
                ('name', models.CharField(max_length=200)),
                ('text', models.CharField(max_length=5000)),
                ('deadline', models.DateField(null=True)),
                ('is_done', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='work_conditions_proposals_author', to='accounts.userprofile')),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='work_conditions_proposals', to='accounts.department')),
                ('responsible', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='work_conditions_proposals_responsible', to='accounts.userprofile')),
            ],
        ),
    ]
