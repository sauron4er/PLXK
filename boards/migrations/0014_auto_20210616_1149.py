# Generated by Django 3.1.4 on 2021-06-16 08:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('boards', '0013_auto_20210615_1059'),
    ]

    operations = [
        migrations.RenameField(
            model_name='non_compliance_approval',
            old_name='recomendation',
            new_name='decision',
        ),
        migrations.RenameField(
            model_name='non_compliance_approval',
            old_name='recomendation_time',
            new_name='decision_time',
        ),
        migrations.RemoveField(
            model_name='non_compliance_approval',
            name='comment',
        ),
        migrations.AddField(
            model_name='non_compliance_approval',
            name='phase',
            field=models.CharField(default='1', max_length=1),
        ),
    ]
