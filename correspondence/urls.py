from django.urls import re_path
from . import views

app_name = 'correspondence'

urlpatterns = [
    re_path(r'^new_law', views.new_law, name='new_law'),
    re_path(r'^del_law', views.del_law, name='del_law'),
    re_path(r'^new_scope', views.new_scope, name='new_scope'),
    re_path(r'^del_scope', views.del_scope, name='del_scope'),
    re_path(r'^corr/get_request/(?P<pk>\d+)/$', views.get_request, name='get_request'),
    re_path(r'^corr/get_correspondence/(?P<counterparty>\d+)$', views.get_correspondence, name='get_correspondence'),
    re_path(r'^corr/get_correspondence_info', views.get_correspondence_info, name='get_correspondence_info'),
    re_path(r'^get_request/(?P<pk>\d+)/$', views.get_request, name='get_request'),
    re_path(r'^add_request', views.add_request, name='add_request'),
    re_path(r'^edit_request', views.edit_request, name='edit_request'),
    re_path(r'^deactivate_request/(?P<pk>\d+)$', views.deactivate_request, name='del_request'),
    re_path(r'^get_correspondence/(?P<counterparty>\d+)$', views.get_correspondence, name='get_correspondence'),
    re_path(r'^get_correspondence_info', views.get_correspondence_info, name='get_correspondence_info'),
    re_path(r'^(?P<pk>\d+)/$', views.index, name='index'),

    re_path(r'^corr_templates/$', views.corr_templates, name='corr_templates'),
    re_path(r'^corr_templates/post_corr_template', views.post_corr_template, name='post_corr_template'),
    re_path(r'^corr_templates/del_corr_template', views.del_corr_template, name='del_corr_template'),

    re_path(r'corr/', views.index, name='index'),
    re_path(r'^$', views.index, name='index'),
]
