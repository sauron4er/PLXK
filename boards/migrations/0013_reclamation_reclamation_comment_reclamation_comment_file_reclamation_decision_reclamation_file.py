# Generated by Django 3.1.13 on 2022-10-28 12:49

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0041_vacation_finished'),
        ('production', '0008_product'),
        ('boards', '0012_letter_letter_file'),
    ]

    operations = [
        migrations.CreateModel(
            name='Reclamation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phase', models.PositiveSmallIntegerField()),
                ('dep_chief_approved', models.BooleanField(null=True)),
                ('date_received', models.DateField(auto_now_add=True)),
                ('date_db_added', models.DateField(auto_now_add=True)),
                ('reason', models.CharField(max_length=300)),
                ('final_decision', models.CharField(max_length=500, null=True)),
                ('final_decision_time', models.DateTimeField(null=True)),
                ('car_number', models.CharField(max_length=10)),
                ('date_manufacture', models.DateField()),
                ('date_shipment', models.DateField()),
                ('is_active', models.BooleanField(default=True)),
                ('answer_responsible_dep', models.ForeignKey(null=True, on_delete=django.db.models.deletion.RESTRICT, related_name='reclamations_responsible', to='accounts.department')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='reclamations_added', to='accounts.userprofile')),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='reclamations', to='boards.counterparty')),
                ('dep_chief', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='dep_reclamations', to='accounts.userprofile')),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='reclamations', to='accounts.department')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='reclamations', to='production.product')),
                ('responsible', models.ForeignKey(null=True, on_delete=django.db.models.deletion.RESTRICT, related_name='reclamations_responsible', to='accounts.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='Reclamation_comment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('comment', models.CharField(max_length=1000, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='reclamations_comments', to='accounts.userprofile')),
                ('original_comment', models.ForeignKey(null=True, on_delete=django.db.models.deletion.RESTRICT, related_name='answers', to='boards.reclamation_comment')),
                ('reclamation', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='comments', to='boards.reclamation')),
            ],
        ),
        migrations.CreateModel(
            name='Reclamation_file',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='boards/reclamations/%Y/%m')),
                ('name', models.CharField(max_length=100)),
                ('is_active', models.BooleanField(default=True)),
                ('reclamation', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='files', to='boards.reclamation')),
            ],
        ),
        migrations.CreateModel(
            name='Reclamation_decision',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('decision', models.CharField(max_length=500, null=True)),
                ('decision_time', models.DateTimeField(null=True)),
                ('phase', models.SmallIntegerField(default=1)),
                ('is_active', models.BooleanField(default=True)),
                ('reclamation', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='decisions', to='boards.reclamation')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='reclamations_decisions', to='accounts.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='Reclamation_comment_file',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='boards/reclamations/%Y/%m')),
                ('name', models.CharField(max_length=100)),
                ('is_active', models.BooleanField(default=True)),
                ('comment', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='comment_files', to='boards.reclamation_comment')),
            ],
        ),
    ]
