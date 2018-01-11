from django.conf.urls import url

from . import views

urlpatterns = [
    #url(r'^$', views.index, name='index'),
    url(r'^news/$', views.news, name='news'),
    url(r'^/news_detail/(?P<pk>[0-9]+)/$', views.news_detail, name='news_detail'),

]