from django.conf.urls import url
from . import views

app_name = 'tickets'

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^f(?P<fk>\d+)/$', views.index_f, name='index_f'),
    url(r'^detail/(?P<pk>\d+)/$', views.detail, name='detail'),
    url(r'^new/$', views.new, name='new'),
    #url(r'^(?P<pk>[0-9]+)/$', views.DetailView.as_view(), name='detail'),

]