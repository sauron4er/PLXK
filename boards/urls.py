from django.urls import re_path
from . import views, views_counterparties, views_non_compliances, views_reclamations
from docs.views_contracts import get_info_for_contracts_page, get_contracts, get_contract, \
    get_simple_contracts_list, add_contract
from correspondence.views import get_correspondence, get_correspondence_info, get_request
from edms.views import edms_get_table_first, edms_get_table_all, edms_get_doc, edms_mark


app_name = 'boards'

urlpatterns = [
    re_path(r'^$', views.forum, name='index'),
    re_path(r'^(?P<pk>\d+)/$', views.board_topics, name='topics'),
    re_path(r'^(?P<pk>\d+)/new/$', views.new_topics, name='new_topic'),

    re_path(r'^plhk_ads/', views.plhk_ads, name='plhk_ads'),
    re_path(r'^plhk_ads/reload/', views.reload, name='reload'),
    re_path(r'^edit_ads/', views.edit_ads, name='edit_ads'),
    re_path(r'^new_ad/', views.new_ad, name='new_ad'),
    re_path(r'^del_ad/(?P<pk>\d+)/$', views.del_ad, name='del_ad'),

    re_path(r'^.+/add_contract', add_contract, name='add_contract'),
    re_path(r'^.+/get_non_compliances/(?P<counterparty>\w+)/(?P<page>\d+)/$', views_non_compliances.get_non_compliances, name='get_non_compliances'),
    re_path(r'^.+/get_non_compliance/(?P<pk>\d+)/$', views_non_compliances.get_non_compliance, name='get_non_compliance'),
    re_path(r'^.+/post_non_compliance', views_non_compliances.post_non_compliance, name='post_non_compliance'),
    re_path(r'^.+/dep_chief_approval', views_non_compliances.dep_chief_approval, name='dep_chief_approval'),
    re_path(r'^.+/post_new_comment', views_non_compliances.post_new_comment, name='post_new_comment'),
    re_path(r'^.+/post_decision', views_non_compliances.post_decision, name='post_decision'),
    re_path(r'^.+/non_compliance_done', views_non_compliances.done, name='done'),

    re_path(r'^.+/get_reclamations/(?P<counterparty>\w+)/(?P<page>\d+)/$', views_reclamations.get_reclamations, name='get_reclamations'),
    re_path(r'^.+/get_reclamation/(?P<pk>\d+)/$', views_reclamations.get_reclamation, name='get_reclamation'),
    re_path(r'^.+/post_reclamation', views_reclamations.post_reclamation, name='post_reclamation'),
    re_path(r'^.+/reclamation_dep_chief_approval', views_reclamations.dep_chief_approval, name='reclamation_dep_chief_approval'),
    re_path(r'^.+/reclamation_post_new_comment', views_reclamations.post_new_comment, name='reclamation_post_new_comment'),
    re_path(r'^.+/reclamation_post_decision', views_reclamations.post_decision, name='reclamation_post_decision'),
    # re_path(r'^.+/reclamation_done', views_reclamations.done, name='reclamation_done'),

    re_path(r'^.+get_letters/(?P<counterparty_id>\d+)', views_counterparties.get_letters, name='get_letters'),
    re_path(r'^.+post_letter', views_counterparties.post_letter, name='post_letter'),
    re_path(r'^.+del_letter', views_counterparties.del_letter, name='del_letter'),

    re_path(r'^ex_phones', views.ex_phones, name='ex_phones'),
    re_path(r'^new_ex_phone', views.new_ex_phone, name='new_ex_phone'),
    re_path(r'^del_ex_phone', views.del_ex_phone, name='del_ex_phone'),
    re_path(r'^del_ex_phone', views.del_ex_phone, name='del_ex_phone'),

    re_path(r'^providers/get_providers/(?P<wood_only>\w+)/(?P<page>\d+)/$', views_counterparties.get_providers, name='get_providers'),
    re_path(r'^providers/get_provider/(?P<pk>\d+)/$', views_counterparties.get_provider, name='get_provider'),
    re_path(r'^providers/post_provider/', views_counterparties.post_provider, name='post_provider'),
    re_path(r'^providers/deact_counterparty/(?P<pk>\d+)/$', views_counterparties.deact_counterparty, name='deact_counterparty'),
    re_path(r'^providers/get_certification/(?P<provider_id>\d+)/$', views_counterparties.get_certification, name='get_certification'),
    re_path(r'^providers/post_certificate/', views_counterparties.post_certificate, name='post_certificate'),
    re_path(r'^providers/deact_certificate/(?P<pk>\d+)/$', views_counterparties.deact_certificate, name='deact_certificate'),
    re_path(r'^providers/get_certificate/(?P<pk>\d+)/$', views_counterparties.get_certificate, name='get_certificate'),
    re_path(r'^providers/post_certificate_pause/', views_counterparties.post_certificate_pause, name='post_certificate_pause'),
    re_path(r'^providers/deact_cert_pause/(?P<pk>\d+)/$', views_counterparties.deact_cert_pause, name='deact_cert_pause'),
    re_path(r'^providers/get_info_for_contracts_page', get_info_for_contracts_page, name='get_info_for_contracts_page'),
    re_path(r'^providers/get_contracts/(?P<counterparty>-?\d+)/(?P<company>\w+)/(?P<with_add>\w+)/(?P<page>\w+)/$', get_contracts, name='get_contracts'),
    re_path(r'^providers/get_contract/(?P<pk>\d+)/$', get_contract, name='get_contract'),
    re_path(r'^providers/get_simple_contracts_list/(?P<counterparty>\w+)/(?P<company>\w+)/$', get_simple_contracts_list, name='get_simple_contracts_list'),
    re_path(r'^providers/get_counterparties_for_select/', views_counterparties.get_counterparties_for_select, name='get_counterparties_for_select'),
    re_path(r'^providers/get_google_api', views_counterparties.get_google_api, name='get_google_api'),
    re_path(r'^providers/', views_counterparties.providers, name='providers'),

    re_path(r'^clients/get_clients/(?P<page>\d+)/$', views_counterparties.get_clients, name='get_clients'),
    re_path(r'^clients/get_client/(?P<pk>\d+)/$', views_counterparties.get_client, name='get_client'),
    re_path(r'^clients/post_client/', views_counterparties.post_client, name='post_client'),
    re_path(r'^clients/post_client_bag_schemes/', views_counterparties.post_client_bag_schemes, name='post_client_bag_schemes'),
    re_path(r'^clients/deact_counterparty/(?P<pk>\d+)/$', views_counterparties.deact_counterparty, name='deact_counterparty'),
    re_path(r'^clients/get_info_for_contracts_page', get_info_for_contracts_page, name='get_info_for_contracts_page'),
    re_path(r'^clients/get_contracts/(?P<counterparty>-?\d+)/(?P<company>\w+)/(?P<with_add>\w+)/(?P<page>\w+)/$', get_contracts, name='get_contracts'),
    re_path(r'^clients/get_contract/(?P<pk>\d+)/$', get_contract, name='get_contract'),
    re_path(r'^clients/get_simple_contracts_list/(?P<counterparty>\w+)/(?P<company>\w+)/$', get_simple_contracts_list, name='get_simple_contracts_list'),
    re_path(r'^clients/get_counterparties_for_select/', views_counterparties.get_counterparties_for_select, name='get_counterparties_for_select'),
    re_path(r'^clients/get_correspondence/(?P<counterparty>\d+)$', get_correspondence, name='get_correspondence'),
    re_path(r'^clients/get_correspondence_info', get_correspondence_info, name='get_correspondence_info'),
    re_path(r'^clients/get_request/(?P<pk>\d+)/$', get_request, name='get_request'),
    re_path(r'^clients/get_table_first/(?P<meta_doc_type>\d+)/(?P<counterparty>\d+)/$', edms_get_table_first, name='get_table_first'),
    re_path(r'^clients/get_table_all/(?P<meta_doc_type>\d+)/(?P<counterparty>\d+)/$', edms_get_table_all, name='get_table_all'),
    re_path(r'^clients/get_doc/(?P<pk>\d+)/$', edms_get_doc, name='get_doc_info'),
    re_path(r'^clients/mark/', edms_mark, name='my_docs_mark'),
    re_path(r'^clients/get_google_api', views_counterparties.get_google_api, name='get_google_api'),
    re_path(r'^clients/', views_counterparties.clients, name='clients'),

    re_path(r'^non_compliances/', views_non_compliances.non_compliances, name='non_compliances'),
    re_path(r'^reclamations/', views_reclamations.reclamations, name='reclamations'),

    re_path(r'^convert_files_names_to_utf/', views.convert_files_names_to_utf, name='convert_files_names_to_utf'),
]
