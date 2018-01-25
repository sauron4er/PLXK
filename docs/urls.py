from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^f(?P<fk>\d+)/$', views.index_f, name='index_f'),
    url(r'^new/$',views.new_doc, name='new_doc'),
    url(r'^(?P<pk>\d+)/$', views.edit_doc, name='edit_doc'),

    url(r'^order/f(?P<fk>\d+)/$', views.index_order_f, name='index_order_f'),
    url(r'^order/new/$', views.new_order_doc, name='new_order_doc'),
    url(r'^order/edit/(?P<pk>\d+)/$', views.edit_order_doc, name='edit_order_doc'),
    #url(r'^(?P<pk>\d+)/new/$', views.new_topics, name='new_topic'),
]

