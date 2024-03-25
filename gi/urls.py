from django.urls import re_path
from . import views

app_name = 'gi'

urlpatterns = [
    #re_path(r'^$', views.index, name='index'),
    re_path(r'^news/$', views.news, name='news'),
    re_path(r'^news_detail/(?P<pk>[0-9]+)/$', views.news_detail, name='news_detail'),

]