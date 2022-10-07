from django.conf.urls import url
from . import views

app_name = 'production'

urlpatterns = [
    url(r'^products', views.products, name='products'),
    url(r'^new_product', views.new_product, name='new_product'),
    url(r'^del_product', views.del_product, name='del_product'),

    url(r'^mockup_types', views.mockup_types, name='mockup_types'),
    url(r'^new_mockup_type', views.new_mockup_type, name='new_mockup_type'),
    url(r'^del_mockup_type', views.del_mockup_type, name='del_mockup_type'),

    url(r'^mockup_product_types', views.mockup_product_types, name='mockup_product_types'),
    url(r'^new_mockup_product_type', views.new_mockup_product_type, name='new_mockup_product_type'),
    url(r'^del_mockup_product_type', views.del_mockup_product_type, name='del_mockup_product_type'),

    url(r'^scopes', views.scopes, name='scopes'),
    url(r'^new_scope', views.new_scope, name='new_scope'),
    url(r'^del_scope', views.del_scope, name='del_scope'),

    url(r'^contract_subjects', views.contract_subjects, name='contract_subjects'),
    url(r'^post_contract_subject', views.post_contract_subject, name='post_contract_subject'),
    url(r'^del_contract_subject', views.del_contract_subject, name='del_contract_subject'),
]
