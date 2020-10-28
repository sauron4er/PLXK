from django.conf.urls import url
from . import views
from . import views_contracts
from edms.views import edms_get_doc

urlpatterns = [
    url(r'^.+/get_order/(?P<pk>\d+)/$', views.get_order, name='get_order'),
    url(r'^$', views.index, name='index'),
    url(r'^f(?P<fk>\d+)/$', views.docs, name='docs'),
    url(r'^new/$', views.new_doc, name='new_doc'),
    url(r'^(?P<pk>\d+)/$', views.edit_doc, name='edit_doc'),

    # url(r'^order/f(?P<fk>\d+)/$', views.orders, name='orders'),
    url(r'^orders/get_orders/(?P<page>\d+)/$', views.get_orders, name='get_orders'),
    url(r'^orders/get_calendar', views.get_calendar, name='get_calendar'),
    url(r'^orders/reminders', views.reminders, name='reminders'),
    url(r'^orders/add_order', views.add_order, name='add_order'),
    url(r'^orders/edit_order', views.edit_order, name='edit_order'),
    url(r'^orders/post_responsible_file', views.post_responsible_file, name='post_responsible_file'),
    url(r'^orders/deactivate_order', views.deact_order, name='deact_order'),
    url(r'^orders/responsible_done/(?P<pk>\d+)/$', views.responsible_done, name='responsible_done'),
    url(r'^orders/', views.orders, name='orders'),

    url(r'^contracts/get_contract/(?P<pk>\d+)/$', views_contracts.get_contract, name='get_contract'),
    url(r'^contracts/add_contract', views_contracts.add_contract, name='add_contract'),
    url(r'^contracts/edit_contract', views_contracts.edit_contract, name='edit_contract'),
    url(r'^contracts/deactivate_contract/(?P<pk>\d+)/$', views_contracts.deactivate_contract, name='deactivate_contract'),
    url(r'^contracts/get_doc/(?P<pk>\d+)/$', edms_get_doc, name='get_doc_info'),
    url(r'^contracts/', views_contracts.index, name='contracts'),

    # url(r'^order/new/$', views.new_order, name='new_order'),
    # url(r'^order/edit/(?P<pk>\d+)/$', views.edit_order, name='edit_order'),
    # url(r'^(?P<pk>\d+)/new/$', views.new_topics, name='new_topic'),
]

