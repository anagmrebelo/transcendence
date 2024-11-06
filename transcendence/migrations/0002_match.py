# Generated by Django 5.1 on 2024-11-06 11:37

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transcendence', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('winner_points', models.IntegerField(default=0)),
                ('loser_points', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('loser_username', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='lost_matches', to=settings.AUTH_USER_MODEL)),
                ('winner_username', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='won_matches', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
