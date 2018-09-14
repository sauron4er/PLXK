from django.db import models
from django.contrib.auth.models import User
#from pytz import timezone

from gi.models import Country
from datetime import datetime, timedelta
from django.utils import timezone

class Season(models.Model):
    name = models.CharField(max_length=200)
    season_begin = models.DateField(null=True,blank=True)
    season_end = models.DateField(null=True,blank=True)
    def __str__(self):
        return self.name

class Team(models.Model):
    name = models.CharField(max_length=200)
    country = models.ForeignKey(Country, related_name='country', blank=True, null=True, on_delete='CASCADE')
    city = models.CharField(max_length=200, null=True, blank=True)
    logo = models.ImageField(upload_to='teams_logo', null=True, blank=True)
    def __str__(self):
        return self.name
    class Meta:
        verbose_name = 'Команда'
        verbose_name_plural = 'Команди'
        ordering = ('name',)

class Team_in_season(models.Model):
    season = models.ForeignKey(Season, related_name='season', blank=True, null=True, on_delete='CASCADE')
    team = models.ForeignKey(Team, related_name='team', blank=True, null=True, on_delete='CASCADE')
    group = models.CharField(max_length=200)
    initial_place = models.IntegerField(null=True, blank=True)

class Match(models.Model):
    dt = models.DateTimeField(null=True, blank=True)
    season = models.ForeignKey(Season, related_name='season1', blank=True, null=True, on_delete='CASCADE',default=1)
    team1 = models.ForeignKey(Team, related_name='team1', blank=True, null=True, on_delete='CASCADE')
    team2 = models.ForeignKey(Team, related_name='team2', blank=True, null=True, on_delete='CASCADE')
    team1_result = models.IntegerField(null=True, blank=True)
    team2_result = models.IntegerField(null=True, blank=True)
    status = models.IntegerField(null=True, blank=True,default=0)
    def txt(self):
        return self.team1.name + " - " + self.team2.name
    def __str__(self):
        return self.team1.name + " - " + self.team2.name
    def is_editing(self):
        return timezone.now() < self.dt - timedelta(hours=1)

class Bet(models.Model):
    player = models.ForeignKey(User, related_name='+', on_delete=models.CASCADE)
    match = models.ForeignKey(Match, related_name='match', blank=True, null=True, on_delete='CASCADE')
    team1_bet = models.IntegerField(null=True, blank=True)
    team2_bet = models.IntegerField(null=True, blank=True)
    points = models.IntegerField(null=True, blank=True, default=0)
    rate_points = models.IntegerField(null=True, blank=True, default=0)
    def __str__(self):
        return self.player.userprofile.pip + " : " + self.match.team1.name + " - " + self.match.team2.name

    def is_editing(self):
        return datetime.now() < self.match.dt - timedelta(hours=1)


class Rate(models.Model):
    match = models.ForeignKey(Match, related_name='matches', blank=True, null=True, on_delete='CASCADE')
    team1_rate = models.IntegerField(null=True, blank=True)
    team2_rate = models.IntegerField(null=True, blank=True)
    draw_rate = models.IntegerField(null=True, blank=True)
