from django.urls import re_path
from . import views
from . import views_contracts
from edms.views import edms_get_doc
from boards.views_counterparties import get_counterparties_for_select

app_name = 'docs'

urlpatterns = [
    re_path(r'^smya/new_doc/$', views.new_doc, name='new_doc'),
    re_path(r'^smya/$', views.index, name='index'),
    re_path(r'^get_docs_excel/$', views.get_docs_excel, name='get_docs_excel'),
    re_path(r'^f(?P<fk>\d+)/get_docs_excel/$', views.get_docs_excel, name='get_docs_excel'),

    re_path(r'^.+/get_order/(?P<pk>\d+)/$', views.get_order, name='get_order'),

    re_path(r'^$', views.index, name='index'),
    re_path(r'^f(?P<fk>\d+)/$', views.docs, name='docs'),

    re_path(r'^edit_doc/(?P<pk>\d+)/$', views.edit_doc, name='edit_doc'),
    re_path(r'^f(?P<fk>\d+)/edit_doc/(?P<pk>\d+)/$', views.edit_doc, name='edit_doc'),

    # re_path(r'^order/f(?P<fk>\d+)/$', views.orders, name='orders'),
    re_path(r'^orders/get_orders/(?P<page>\d+)/$', views.get_orders, name='get_orders'),
    re_path(r'^orders/get_calendar/(?P<view>\w+)', views.get_calendar, name='get_calendar'),
    re_path(r'^orders/reminders', views.reminders, name='reminders'),
    re_path(r'^orders/add_order', views.add_order, name='add_order'),
    re_path(r'^orders/edit_order', views.edit_order, name='edit_order'),
    re_path(r'^orders/post_responsible_file', views.post_responsible_file, name='post_responsible_file'),
    re_path(r'^orders/deactivate_order', views.deact_order, name='deact_order'),
    re_path(r'^orders/responsible_done/(?P<pk>\d+)/$', views.responsible_done, name='responsible_done'),
    re_path(r'^orders/', views.orders, name='orders'),

    re_path(r'^contracts/get_contracts/(?P<counterparty>\w+)/(?P<company>\w+)/(?P<with_add>\w+)/(?P<page>\w+)/$', views_contracts.get_contracts, name='get_contracts'),
    re_path(r'^contracts/get_contract/(?P<pk>\d+)/$', views_contracts.get_contract, name='get_contract'),
    re_path(r'^contracts/get_simple_contracts_list/(?P<counterparty>\w+)/(?P<company>\w+)/$', views_contracts.get_simple_contracts_list, name='get_simple_contracts_list'),
    # re_path(r'^contracts/get_additional_contracts/(?P<pk>\d+)/$', views_contracts.get_additional_contracts, name='get_additional_contracts'),
    re_path(r'^contracts/add_contract', views_contracts.add_contract, name='add_contract'),
    # re_path(r'^contracts/edit_contract', views_contracts.edit_contract, name='edit_contract'),
    re_path(r'^contracts/deactivate_contract/(?P<pk>\d+)/$', views_contracts.deactivate_contract, name='deactivate_contract'),
    re_path(r'^contracts/get_doc/(?P<pk>\d+)/$', edms_get_doc, name='get_doc_info'),
    re_path(r'^contracts/get_counterparties/', get_counterparties_for_select, name='get_counterparties_for_select'),
    re_path(r'^contracts/get_info_for_contracts_page', views_contracts.get_info_for_contracts_page, name='get_info_for_contracts_page'),
    re_path(r'^contracts/contract_reg_numbers', views_contracts.contract_reg_numbers, name='contract_reg_numbers'),
    re_path(r'^contracts/get_contract_reg_numbers/(?P<page>\d+)/$', views_contracts.get_contract_reg_numbers, name='get_contract_reg_numbers'),
    re_path(r'^contracts/', views_contracts.index, name='contracts'),

    # re_path(r'^order/new/$', views.new_order, name='new_order'),
    # re_path(r'^order/edit/(?P<pk>\d+)/$', views.edit_order, name='edit_order'),
    # re_path(r'^(?P<pk>\d+)/new/$', views.new_topics, name='new_topic'),
]

