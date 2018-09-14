from django.contrib import admin
from .models import Season, Team_in_season, Team, Match, Bet, Rate

admin.site.register(Season)
admin.site.register(Team_in_season)
admin.site.register(Team)
admin.site.register(Match)
admin.site.register(Bet)
admin.site.register(Rate)
