from django.conf.urls import url
from ordering import views

app_name = 'ordering'

urlpatterns = [
    url(r'^stationery_catalogue/new_stationery_type', views.new_stationery_type, name='new_stationery_type'),
    url(r'^stationery_catalogue/del_stationery_type', views.del_stationery_type, name='del_stationery_type'),
    url(r'^stationery_catalogue', views.stationery_catalogue, name='stationery_catalogue'),

    # url(r'^stationery_order/new_stationery_order', views.new_stationery_order, name='new_stationery_order'),
    # url(r'^stationery_order/del_stationery_order', views.del_stationery_order, name='del_stationery_order'),
    # url(r'^stationery_order/', views.stationery_order, name='stationery_order'),

    url(r'^stationery/del_order', views.del_stationery_order, name='del_stationery_order'),
    url(r'^stationery/new_order', views.new_stationery_order, name='new_stationery_order'),
    url(r'^stationery/edit_order', views.edit_stationery_order, name='edit_stationery_order'),
    url(r'^stationery/get_orders/(?P<month>\d+)/(?P<year>\d+)/$', views.get_orders, name='get_orders'),
    url(r'^stationery/get_summary/(?P<month>\d+)/(?P<year>\d+)/$', views.get_summary, name='get_summary'),
    url(r'^stationery/', views.stationery, name='stationery'),
]
