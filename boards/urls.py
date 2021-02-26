from django.conf.urls import url
from . import views, views_org_structure, views_providers

app_name = 'boards'

urlpatterns = [
    url(r'^$', views.forum, name='index'),
    url(r'^(?P<pk>\d+)/$', views.board_topics, name='topics'),
    url(r'^(?P<pk>\d+)/new/$', views.new_topics, name='new_topic'),

    url(r'^plhk_ads/', views.plhk_ads, name='plhk_ads'),
    url(r'^plhk_ads/reload/', views.reload, name='reload'),
    url(r'^edit_ads/', views.edit_ads, name='edit_ads'),
    url(r'^new_ad/', views.new_ad, name='new_ad'),
    url(r'^del_ad/(?P<pk>\d+)/$', views.del_ad, name='del_ad'),

    url(r'^org_structure/get_seat_info/(?P<pk>\d+)/$', views_org_structure.get_seat_info, name='get_seat_info'),
    url(r'^org_structure/post_instruction/', views_org_structure.post_instruction, name='post_instruction'),
    url(r'^org_structure/', views_org_structure.org_structure, name='org_structure'),

    url(r'^providers/post_provider/', views_providers.post_provider, name='post_provider'),
    url(r'^providers/get_provider/(?P<pk>\d+)/$', views_providers.get_provider, name='get_provider'),
    url(r'^providers/get_cert_types/', views_providers.get_cert_types, name='get_cert_types'),
    url(r'^providers/', views_providers.providers, name='providers'),
]