# Generated by Django 3.1.13 on 2022-04-25 07:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('boards', '0010_non_compliance_non_compliance_comment_non_compliance_comment_file_non_compliance_decision_non_compli'),
    ]

    operations = [
        migrations.AddField(
            model_name='counterparty',
            name='commentary',
            field=models.CharField(max_length=3000, null=True),
        ),
    ]
