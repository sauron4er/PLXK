from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^new_client', views.new_client, name='new_client'),
    url(r'^del_client', views.del_client, name='del_client'),
    url(r'^new_law', views.new_law, name='new_law'),
    url(r'^del_law', views.del_law, name='del_law'),
    url(r'^new_request', views.new_request, name='new_request'),
    url(r'^edit_request', views.edit_request, name='edit_request'),
    url(r'^del_request', views.del_request, name='del_request'),
    url(r'^$', views.index, name='index'),
]

