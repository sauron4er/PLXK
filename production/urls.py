from django.urls import re_path
from . import views

app_name = 'production'

urlpatterns = [
    re_path(r'^products', views.products, name='products'),
    re_path(r'^new_product', views.new_product, name='new_product'),
    re_path(r'^del_product', views.del_product, name='del_product'),

    re_path(r'^mockup_types', views.mockup_types, name='mockup_types'),
    re_path(r'^new_mockup_type', views.new_mockup_type, name='new_mockup_type'),
    re_path(r'^del_mockup_type', views.del_mockup_type, name='del_mockup_type'),

    re_path(r'^mockup_product_types', views.mockup_product_types, name='mockup_product_types'),
    re_path(r'^new_mockup_product_type', views.new_mockup_product_type, name='new_mockup_product_type'),
    re_path(r'^del_mockup_product_type', views.del_mockup_product_type, name='del_mockup_product_type'),

    re_path(r'^scopes', views.scopes, name='scopes'),
    re_path(r'^new_scope', views.new_scope, name='new_scope'),
    re_path(r'^del_scope', views.del_scope, name='del_scope'),

    re_path(r'^contract_subjects', views.contract_subjects, name='contract_subjects'),
    re_path(r'^post_contract_subject', views.post_contract_subject, name='post_contract_subject'),
    re_path(r'^del_contract_subject', views.del_contract_subject, name='del_contract_subject'),

    re_path(r'^permission_categories', views.permission_categories, name='permission_categories'),
    re_path(r'^new_permission_category', views.new_permission_category, name='new_permission_category'),
    re_path(r'^del_permission_category', views.del_permission_category, name='del_permission_category'),
]
