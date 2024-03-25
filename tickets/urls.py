from django.urls import re_path
from . import views

app_name = 'tickets'

urlpatterns = [
    re_path(r'^$', views.index, name='index'),
    re_path(r'^f(?P<fk>\d+)/$', views.index_f, name='index_f'),
    re_path(r'^detail/(?P<pk>\d+)/$', views.detail, name='detail'),
    re_path(r'^new/$', views.new, name='new'),
    #re_path(r'^(?P<pk>[0-9]+)/$', views.DetailView.as_view(), name='detail'),

]