from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^f(?P<fk>\d+)/$', views.index_f, name='index_f'),
    url(r'^new/$',views.new_doc, name='new_doc'),
    url(r'^(?P<pk>\d+)/$', views.edit_doc, name='edit_doc'),
    #url(r'^(?P<pk>\d+)/new/$', views.new_topics, name='new_topic'),
]

