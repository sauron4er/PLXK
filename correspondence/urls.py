from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^new_client', views.new_client, name='new_client'),
    url(r'^del_client', views.del_client, name='del_client'),
    url(r'^new_law', views.new_law, name='new_law'),
    url(r'^del_law', views.del_law, name='del_law'),
    url(r'^$', views.index, name='index'),
]
