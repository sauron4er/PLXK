from django.conf.urls import include, url

from edms.views import edms_hr, edms_hr_emp, edms_hr_dep, edms_hr_seat, edms_hr_emp_seat, edms_get_user, \
    edms_new_vacation, edms_deactivate_vacation, edms_start_vacations_arrange, edms_get_vacations  # Відділ кадрів
from edms.views import edms_my_docs, edms_get_doc, edms_get_chiefs, edms_get_direct_subs, edms_get_emp_seats  # Мої документи get
from edms.views import edms_mark, edms_del_doc  # Мої документи post
from edms.views import edms_get_deps, edms_get_seats, edms_get_drafts, edms_get_templates, edms_get_doc_type_modules  # Нові документи
from edms.views import edms_archive  # Архів
from edms.views import edms_sub_docs, edms_get_sub_docs, edms_get_sub_emps  # Документи підлеглих
from edms.views import edms_get_doc_types

urlpatterns = [
  #  url(r'^$', RedirectView.as_view(url='/main', permanent=True)),
  #  url(r'^main/', edms_main, name='main'),

    url(r'^.+/get_doc/(?P<pk>\d+)/$', edms_get_doc, name='get_doc_info'),  # Запит на інформацію про документ
    url(r'^.+/get_deps/', edms_get_deps, name='get_deps'),
    url(r'^.+/get_seats/', edms_get_seats, name='get_seats'),

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

    url(r'^my_docs/get_emp_seats/', edms_get_emp_seats, name='my_docs_get_emp_seats'),
    url(r'^my_docs/get_drafts/', edms_get_drafts, name='my_docs_get_drafts'),
    url(r'^my_docs/get_templates/', edms_get_templates, name='my_docs_get_templates'),
    url(r'^my_docs/get_chiefs/(?P<pk>\d+)/$', edms_get_chiefs, name='my_docs_get_chiefs'),
    url(r'^my_docs/del_doc/(?P<pk>\d+)/$', edms_del_doc, name='del_doc'),
    url(r'^my_docs/get_direct_subs/(?P<pk>\d+)/$', edms_get_direct_subs, name='my_docs_get_direct_subs'),
    url(r'^my_docs/mark/', edms_mark, name='my_docs_mark'),
    # url(r'^my_docs/resolution/', edms_resolution, name='my_docs_resolution'),
    url(r'^my_docs/get_doc_type_modules/(?P<pk>\d+)/$', edms_get_doc_type_modules, name='my_docs_get_doc_type_modules'),
    url(r'^my_docs/', edms_my_docs, name='my_docs'),

    url(r'^archive/', edms_archive, name='archive'),

    url(r'^sub_docs/get_doc_types/', edms_get_doc_types, name='get_doc_types'),
    url(r'^sub_docs/get_sub_emps/(?P<pk>\d+)/$', edms_get_sub_emps, name='get_sub_emps'),
    url(r'^sub_docs/get/(?P<emp_seat>\d+)/(?P<doc_type>\d+)/(?P<sub_emp>\d+)/$', edms_get_sub_docs, name='get_sub_docs'),
    url(r'^sub_docs/', edms_sub_docs, name='sub_docs'),

]
