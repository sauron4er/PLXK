from django.conf.urls import url
from bets import views


urlpatterns = [
    url(r'^$', views.index, name='index'),
    #url(r'^(?P<pk>\d+)/$', views.board_topics, name='topics'),
    #url(r'^(?P<pk>\d+)/new/$', views.new_topics, name='new_topic'),
]