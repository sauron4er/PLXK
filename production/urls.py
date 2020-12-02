from django.conf.urls import url
from . import views

app_name = 'production'

urlpatterns = [
    url(r'^clients', views.clients, name='clients'),
    url(r'^new_client', views.new_client, name='new_client'),
    url(r'^del_client', views.del_client, name='del_client'),

    url(r'^mockup_types', views.mockup_types, name='mockup_types'),
    url(r'^new_mockup_type', views.new_mockup_type, name='new_mockup_type'),
    url(r'^del_mockup_type', views.del_mockup_type, name='del_mockup_type'),

    url(r'^mockup_product_types', views.mockup_product_types, name='mockup_product_types'),
    url(r'^new_mockup_product_type', views.new_mockup_product_type, name='new_mockup_product_type'),
    url(r'^del_mockup_product_type', views.del_mockup_product_type, name='del_mockup_product_type'),
]
