# Generated by Django 3.1.13 on 2023-03-20 08:46

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0042_userprofile_permissions_edit'),
        ('production', '0009_permission_category'),
        ('boards', '0013_reclamation_reclamation_comment_reclamation_comment_file_reclamation_decision_reclamation_file'),
    ]

    operations = [
        migrations.CreateModel(
            name='Permission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('info', models.CharField(max_length=5000, null=True)),
                ('comment', models.CharField(max_length=2000, null=True)),
                ('date_next', models.DateField(default=django.utils.timezone.now)),
                ('is_active', models.BooleanField(default=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='permissions_added', to='accounts.userprofile')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='permissions', to='production.permission_category')),
                ('department', models.ForeignKey(null=True, on_delete=django.db.models.deletion.RESTRICT, related_name='permissions', to='accounts.department')),
            ],
        ),
        migrations.CreateModel(
            name='Permission_Responsible',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_active', models.BooleanField(default=True)),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='responsible_for_permissions', to='accounts.userprofile')),
                ('permission', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='responsibles', to='boards.permission')),
            ],
        ),
    ]
