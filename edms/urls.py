from django.urls import re_path, include
from edms.views import edms_hr, edms_hr_emp, edms_hr_dep, edms_hr_seat, edms_hr_emp_seat, edms_get_user, \
    edms_new_vacation, edms_deactivate_vacation, edms_start_vacations_arrange, edms_get_vacations  # Відділ кадрів
from edms.views import edms_my_docs, edms_get_doc, edms_get_chiefs, edms_get_direct_subs, edms_get_emp_seats, edms_get_contracts  # Мої документи get
from edms.views import edms_mark, edms_del_doc  # Мої документи post
from edms.views import edms_get_deps, edms_get_seats, edms_get_drafts, edms_get_templates, edms_get_doc_type_modules  # Нові документи
from edms.views import edms_archive, get_archive, get_work_archive, edms_tables, edms_get_table_first, edms_get_table_all
from edms.views import edms_sub_docs, edms_get_sub_docs, edms_get_sub_emps, edms_delegated, edms_get_delegated_docs  # Документи підлеглих
from edms.views import edms_get_doc_types, change_text_module, edms_get_free_times, get_it_tickets, get_doc_type_versions, get_all_employees, \
    del_foyer_range, save_foyer_range, get_cost_rates_products, get_cost_rates_fields, del_approval, add_approvals, get_add_contract_reg_number, \
    get_client_requirements_for_choose
from docs.views_contracts import get_contract
from production.views import get_mockup_types, get_mockup_product_types, get_product_types, get_scopes, contract_subjects_select
from boards.views_counterparties import get_clients_for_product_type, get_counterparties, get_counterparties_for_select
from correspondence.views import get_laws

app_name = 'edms'

urlpatterns = [
    re_path(r'^.+/get_deps/', edms_get_deps, name='get_deps'),
    re_path(r'^.+/get_seats/', edms_get_seats, name='get_seats'),
    re_path(r'^.+/mark/', edms_mark, name='my_docs_mark'),
    re_path(r'^.+/get_doc_type_modules/(?P<meta_type_id>\d+)/(?P<type_id>\d+)/$', edms_get_doc_type_modules, name='my_docs_get_doc_type_modules'),
    re_path(r'^.+/get_clients/(?P<product_type>\d+)/$', get_clients_for_product_type, name='clients'),
    re_path(r'^.+/get_mockup_types/', get_mockup_types, name='mockup_types'),
    re_path(r'^.+/get_mockup_product_types/', get_mockup_product_types, name='mockup_product_types'),
    re_path(r'^.+/post_doc', edms_my_docs, name='my_docs'),
    re_path(r'^.+/get_doc_types/', edms_get_doc_types, name='get_doc_types'),
    re_path(r'^.+/get_sub_emps/(?P<pk>\d+)/$', edms_get_sub_emps, name='get_sub_emps'),
    re_path(r'^.+/get_product_types/(?P<direction>\w+)/', get_product_types, name='get_product_types'),
    re_path(r'^.+/get_scopes', get_scopes, name='get_scopes'),
    re_path(r'^.+/get_laws', get_laws, name='get_laws'),
    re_path(r'^.+/get_emp_seats', edms_get_emp_seats, name='my_docs_get_emp_seats'),
    re_path(r'^.+/get_all_employees', get_all_employees, name='get_all_employees'),
    re_path(r'^.+/get_doc_type_versions/(?P<doc_type_id>\d+)', get_doc_type_versions, name='get_doc_type_versions'),
    re_path(r'^.+/get_contract/(?P<pk>\d+)/$', get_contract, name='get_contract'),


    re_path(r'^hr/emp/(?P<pk>\d+)/$', edms_hr_emp, name='hr_emp'),
    re_path(r'^hr/get_user/(?P<pk>\d+)/$', edms_get_user, name='hr_emp'),
    re_path(r'^hr/dep/(?P<pk>\d+)/$', edms_hr_dep, name='hr_dep'),
    re_path(r'^hr/seat/(?P<pk>\d+)/$', edms_hr_seat, name='hr_seat'),
    re_path(r'^hr/emp_seat/(?P<pk>\d+)/$', edms_hr_emp_seat, name='hr_seat'),
    re_path(r'^hr/new_vacation/', edms_new_vacation, name='new_vacation'),
    re_path(r'^hr/deactivate_vacation/', edms_deactivate_vacation, name='deactivate_vacation'),
    re_path(r'^hr/get_vacations/', edms_get_vacations, name='get_vacations'),
    re_path(r'^hr/start_vacations_arrange/', edms_start_vacations_arrange, name='start_vacations_arrange'),
    re_path(r'^hr/', edms_hr, name='hr'),

    re_path(r'^my_docs/get_counterparties/', get_counterparties, name='get_counterparties'),
    re_path(r'^my_docs/get_contracts/(?P<company>\w+)/(?P<counterparty_id>\d+)', edms_get_contracts, name='my_docs_get_contracts'),
    re_path(r'^my_docs/get_drafts/', edms_get_drafts, name='my_docs_get_drafts'),
    re_path(r'^my_docs/get_templates/', edms_get_templates, name='my_docs_get_templates'),
    re_path(r'^my_docs/get_chiefs/(?P<pk>\d+)/$', edms_get_chiefs, name='my_docs_get_chiefs'),
    re_path(r'^my_docs/del_doc/(?P<pk>\d+)/(?P<deact>\d+)$', edms_del_doc, name='del_doc'),
    re_path(r'^my_docs/get_direct_subs/(?P<pk>\d+)/$', edms_get_direct_subs, name='my_docs_get_direct_subs'),
    re_path(r'^my_docs/change_text_module', change_text_module, name='change_text_module'),
    re_path(r'^my_docs/del_foyer_range/(?P<pk>\d+)$', del_foyer_range, name='del_foyer_range'),
    re_path(r'^my_docs/save_foyer_range', save_foyer_range, name='save_foyer_range'),
    re_path(r'^my_docs/get_cost_rates_products', get_cost_rates_products, name='get_cost_rates_products'),
    re_path(r'^my_docs/get_cost_rates_fields/(?P<product_id>\d+)', get_cost_rates_fields, name='get_cost_rates_fields'),
    re_path(r'^my_docs/del_approval/(?P<approval_id>\d+)', del_approval, name='del_approval'),
    re_path(r'^my_docs/add_approvals', add_approvals, name='add_approvals'),
    re_path(r'^my_docs/get_add_contract_reg_number/(?P<main_contract_id>\d+)', get_add_contract_reg_number, name='get_add_contract_reg_number'),
    re_path(r'^my_docs/get_contract_subjects_select', contract_subjects_select, name='contract_subjects_select'),
    re_path(r'^my_docs/get_client_requirements_for_choose/(?P<counterparty_id>\d+)', get_client_requirements_for_choose, name='get_client_requirements_for_choose'),
    re_path(r'^my_docs/', edms_my_docs, name='my_docs'),

    re_path(r'^archive/get_archive/(?P<archive_type>\w+)/(?P<meta_doc_id>\d+)/(?P<page>\d+)/$', get_archive, name='get_archive'),
    re_path(r'^archive/get_work_archive/(?P<archive_type>\w+)/(?P<meta_doc_id>\d+)/(?P<page>\d+)/$', get_work_archive, name='get_work_archive'),
    re_path(r'^archive/', edms_archive, name='archive'),

    re_path(r'^sub_docs/get/(?P<emp_seat>\d+)/(?P<doc_meta_type>\d+)/(?P<sub_emp>\d+)/$', edms_get_sub_docs, name='get_sub_docs'),
    re_path(r'^sub_docs/', edms_sub_docs, name='sub_docs'),

    re_path(r'^tables/(?P<meta_doc_type>\d+)/get_table_first/(?P<doc_type>\d+)/(?P<counterparty>\d+)/$', edms_get_table_first, name='get_table_first'),
    re_path(r'^tables/(?P<meta_doc_type>\d+)/get_table_all/(?P<doc_type>\d+)/(?P<counterparty>\d+)/$', edms_get_table_all, name='get_table_all'),
    re_path(r'^tables/(?P<meta_doc_type>\d+)/$', edms_tables, name='tables'),
    re_path(r'^tables/get_table_first/(?P<meta_doc_type>\d+)/(?P<counterparty>\d+)/$', edms_get_table_first, name='get_table_first'),
    re_path(r'^tables/get_table_all/(?P<meta_doc_type>\d+)/(?P<counterparty>\d+)/$', edms_get_table_all, name='get_table_all'),
    re_path(r'^tables/(?P<doc_meta_type_id>\d+)/get_emp_seats/', edms_get_emp_seats, name='my_docs_get_emp_seats'),
    re_path(r'^tables/(?P<meta_doc_type>\d+)/get_free_times/(?P<page>\d+)/$', edms_get_free_times, name='get_free_times'),
    re_path(r'^tables/get_free_times/(?P<page>\d+)/$', edms_get_free_times, name='get_free_times'),
    re_path(r'^tables/(?P<meta_doc_type>\d+)/get_it_tickets/(?P<doc_type_version>\d+)/(?P<page>\d+)/$', get_it_tickets, name='get_it_tickets'),
    re_path(r'^tables/get_it_tickets/(?P<doc_type_version>\d+)/(?P<page>\d+)/$', get_it_tickets, name='get_it_tickets'),
    re_path(r'^tables/', edms_tables, name='tables'),

    re_path(r'^delegated/get/(?P<emp>\d+)/(?P<doc_meta_type>\d+)/(?P<sub>\d+)/$', edms_get_delegated_docs, name='get_sub_docs'),
    re_path(r'^delegated/', edms_delegated, name='delegated'),

]
