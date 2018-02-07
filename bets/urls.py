from django.conf.urls import url
from django.contrib.admin import views

from bets import views


urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^teams/$', views.teams, name='teams'),
    url(r'^matches/$', views.matches, name='matches'),
    url(r'^bets/$', views.bets, name='bets'),
    url(r'^new_bet/(?P<mid>\d+)$', views.new_bet, name='new_bet'),

    #url(r'^(?P<pk>\d+)/$', views.board_topics, name='topics'),
    #url(r'^(?P<pk>\d+)/new/$', views.new_topics, name='new_topic'),
]