from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^.+/get_order/(?P<pk>\d+)/$', views.get_order, name='get_order'),
    url(r'^$', views.index, name='index'),
    url(r'^f(?P<fk>\d+)/$', views.docs, name='docs'),
    url(r'^new/$',views.new_doc, name='new_doc'),
    url(r'^(?P<pk>\d+)/$', views.edit_doc, name='edit_doc'),

    # url(r'^order/f(?P<fk>\d+)/$', views.orders, name='orders'),
    url(r'^orders/new_order', views.new_order, name='orders'),
    url(r'^orders/edit_order', views.edit_order, name='orders'),
    url(r'^orders/', views.orders, name='orders'),

    # url(r'^order/new/$', views.new_order, name='new_order'),
    # url(r'^order/edit/(?P<pk>\d+)/$', views.edit_order, name='edit_order'),
    #url(r'^(?P<pk>\d+)/new/$', views.new_topics, name='new_topic'),
]

