from django.conf.urls import include, url
from edms.views import edms_hr, edms_hr_emp, edms_hr_dep, edms_hr_seat, edms_hr_emp_seat, edms_get_user, \
    edms_new_vacation, edms_deactivate_vacation, edms_start_vacations_arrange, edms_get_vacations  # Відділ кадрів
from edms.views import edms_my_docs, edms_get_doc, edms_get_chiefs, edms_get_direct_subs, edms_get_emp_seats, edms_get_contracts  # Мої документи get
from edms.views import edms_mark, edms_del_doc  # Мої документи post
from edms.views import edms_get_deps, edms_get_seats, edms_get_drafts, edms_get_templates, edms_get_doc_type_modules  # Нові документи
from edms.views import edms_archive, edms_get_archive, edms_tables, edms_get_table_first, edms_get_table_all
from edms.views import edms_sub_docs, edms_get_sub_docs, edms_get_sub_emps, edms_delegated, edms_get_delegated_docs  # Документи підлеглих
from edms.views import edms_get_doc_types, change_text_module, edms_get_free_times, get_doc_type_versions, get_all_employees, \
    del_foyer_range, save_foyer_range
from docs.views_contracts import get_contract
from production.views import get_mockup_types, get_mockup_product_types, get_product_types, get_scopes
from boards.views_counterparties import get_clients_for_product_type, get_counterparties, get_counterparties_for_select
from correspondence.views import get_laws

app_name = 'edms'

urlpatterns = [
    url(r'^.+/get_deps/', edms_get_deps, name='get_deps'),
    url(r'^.+/get_seats/', edms_get_seats, name='get_seats'),
    url(r'^.+/mark/', edms_mark, name='my_docs_mark'),
    url(r'^.+/get_doc_type_modules/(?P<meta_type_id>\d+)/(?P<type_id>\d+)/$', edms_get_doc_type_modules, name='my_docs_get_doc_type_modules'),
    url(r'^.+/get_clients/(?P<product_type>\d+)/$', get_clients_for_product_type, name='clients'),
    url(r'^.+/get_mockup_types/', get_mockup_types, name='mockup_types'),
    url(r'^.+/get_mockup_product_types/', get_mockup_product_types, name='mockup_product_types'),
    url(r'^.+/post_doc', edms_my_docs, name='my_docs'),
    url(r'^.+/get_doc_types/', edms_get_doc_types, name='get_doc_types'),
    url(r'^.+/get_sub_emps/(?P<pk>\d+)/$', edms_get_sub_emps, name='get_sub_emps'),
    url(r'^.+/get_product_types/(?P<direction>\w+)/', get_product_types, name='get_product_types'),
    url(r'^.+/get_scopes', get_scopes, name='get_scopes'),
    url(r'^.+/get_laws', get_laws, name='get_laws'),
    url(r'^.+/get_emp_seats/', edms_get_emp_seats, name='my_docs_get_emp_seats'),
    url(r'^.+/get_all_employees', get_all_employees, name='get_all_employees'),
    url(r'^.+/get_doc_type_versions/(?P<doc_type_id>\d+)', get_doc_type_versions, name='get_doc_type_versions'),

    url(r'^hr/emp/(?P<pk>\d+)/$', edms_hr_emp, name='hr_emp'),
    url(r'^hr/get_user/(?P<pk>\d+)/$', edms_get_user, name='hr_emp'),
    url(r'^hr/dep/(?P<pk>\d+)/$', edms_hr_dep, name='hr_dep'),
    url(r'^hr/seat/(?P<pk>\d+)/$', edms_hr_seat, name='hr_seat'),
    url(r'^hr/emp_seat/(?P<pk>\d+)/$', edms_hr_emp_seat, name='hr_seat'),
    url(r'^hr/new_vacation/', edms_new_vacation, name='new_vacation'),
    url(r'^hr/deactivate_vacation/', edms_deactivate_vacation, name='deactivate_vacation'),
    url(r'^hr/get_vacations/', edms_get_vacations, name='get_vacations'),
    url(r'^hr/start_vacations_arrange/', edms_start_vacations_arrange, name='start_vacations_arrange'),
    url(r'^hr/', edms_hr, name='hr'),

    url(r'^my_docs/get_contract/(?P<pk>\d+)/$', get_contract, name='get_contract'),
    url(r'^my_docs/get_counterparties/', get_counterparties, name='get_counterparties'),
    url(r'^my_docs/get_contracts/(?P<company>\w+)/$', edms_get_contracts, name='my_docs_get_contracts'),
    url(r'^my_docs/get_drafts/', edms_get_drafts, name='my_docs_get_drafts'),
    url(r'^my_docs/get_templates/', edms_get_templates, name='my_docs_get_templates'),
    url(r'^my_docs/get_chiefs/(?P<pk>\d+)/$', edms_get_chiefs, name='my_docs_get_chiefs'),
    url(r'^my_docs/del_doc/(?P<pk>\d+)/$', edms_del_doc, name='del_doc'),
    url(r'^my_docs/get_direct_subs/(?P<pk>\d+)/$', edms_get_direct_subs, name='my_docs_get_direct_subs'),
    url(r'^my_docs/change_text_module', change_text_module, name='change_text_module'),
    url(r'^my_docs/del_foyer_range/(?P<pk>\d+)$', del_foyer_range, name='del_foyer_range'),
    url(r'^my_docs/save_foyer_range', save_foyer_range, name='save_foyer_range'),
    url(r'^my_docs/', edms_my_docs, name='my_docs'),

    url(r'^archive/get_archive/(?P<pk>\d+)/$', edms_get_archive, name='get_archive'),
    url(r'^archive/', edms_archive, name='archive'),

    url(r'^sub_docs/get/(?P<emp_seat>\d+)/(?P<doc_meta_type>\d+)/(?P<sub_emp>\d+)/$', edms_get_sub_docs, name='get_sub_docs'),
    url(r'^sub_docs/', edms_sub_docs, name='sub_docs'),

    url(r'^tables/(?P<meta_doc_type>\d+)/get_table_first/(?P<doc_type>\d+)/(?P<counterparty>\d+)/$', edms_get_table_first, name='get_table_first'),
    url(r'^tables/(?P<meta_doc_type>\d+)/get_table_all/(?P<doc_type>\d+)/(?P<counterparty>\d+)/$', edms_get_table_all, name='get_table_all'),
    url(r'^tables/(?P<meta_doc_type>\d+)/$', edms_tables, name='tables'),
    url(r'^tables/get_table_first/(?P<meta_doc_type>\d+)/(?P<counterparty>\d+)/$', edms_get_table_first, name='get_table_first'),
    url(r'^tables/get_table_all/(?P<meta_doc_type>\d+)/(?P<counterparty>\d+)/$', edms_get_table_all, name='get_table_all'),
    url(r'^tables/(?P<doc_meta_type_id>\d+)/get_emp_seats/', edms_get_emp_seats, name='my_docs_get_emp_seats'),
    url(r'^tables/get_free_times/(?P<page>\d+)/$', edms_get_free_times, name='get_free_times'),
    url(r'^tables/', edms_tables, name='tables'),

    url(r'^delegated/get/(?P<emp>\d+)/(?P<doc_meta_type>\d+)/(?P<sub>\d+)/$', edms_get_delegated_docs, name='get_sub_docs'),
    url(r'^delegated/', edms_delegated, name='delegated'),

]
