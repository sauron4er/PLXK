# Generated by Django 3.1.13 on 2022-10-20 13:31

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('edms', '0160_decree_article_decree_article_responsible'),
    ]

    operations = [
        migrations.AlterField(
            model_name='decree_article',
            name='document',
            field=models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='decree_articles', to='edms.document'),
        ),
    ]
