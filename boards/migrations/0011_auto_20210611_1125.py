# Generated by Django 3.1.4 on 2021-06-11 08:25

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('boards', '0010_non_compliance_non_compliance_comment_non_compliance_comment_file_non_compliance_file'),
    ]

    operations = [
        migrations.AlterField(
            model_name='non_compliance_comment_file',
            name='comment',
            field=models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='comment_files', to='boards.non_compliance_comment'),
        ),
    ]
