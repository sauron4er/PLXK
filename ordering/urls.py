from django.urls import re_path
from ordering import views

app_name = 'ordering'

urlpatterns = [
    re_path(r'^new_stationery_type', views.new_stationery_type, name='new_stationery_type'),
    re_path(r'^del_stationery_type', views.del_stationery_type, name='del_stationery_type'),
    re_path(r'^stationery_catalogue', views.stationery_catalogue, name='stationery_catalogue'),

    # re_path(r'^stationery_order/new_stationery_order', views.new_stationery_order, name='new_stationery_order'),
    # re_path(r'^stationery_order/del_stationery_order', views.del_stationery_order, name='del_stationery_order'),
    # re_path(r'^stationery_order/', views.stationery_order, name='stationery_order'),

    re_path(r'^stationery/del_order', views.del_stationery_order, name='del_stationery_order'),
    re_path(r'^stationery/new_order', views.new_stationery_order, name='new_stationery_order'),
    re_path(r'^stationery/edit_order', views.edit_stationery_order, name='edit_stationery_order'),
    re_path(r'^stationery/get_orders/(?P<month>\d+)/(?P<year>\d+)/$', views.get_orders, name='get_orders'),
    re_path(r'^stationery/get_summary/(?P<month>\d+)/(?P<year>\d+)/$', views.get_summary, name='get_summary'),
    re_path(r'^stationery/', views.stationery, name='stationery'),
]
