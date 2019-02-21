from django.conf.urls import include, url

from edms.views import edms_hr, edms_hr_emp, edms_hr_dep, edms_hr_seat, edms_hr_emp_seat, edms_get_emp_seats  # Відділ кадрів
from edms.views import edms_administration, edms_get_types, edms_get_type_info, edms_deactivate_permission  # Адміністрування
from edms.views import edms_my_docs, edms_get_doc, edms_get_chiefs, edms_get_direct_subs  # Мої документи get
from edms.views import edms_mark, edms_resolution  # Мої документи post
from edms.views import edms_get_deps, edms_get_seats, edms_get_drafts  # Нові документи
from edms.views import edms_archive  # Архів
from edms.views import edms_sub_docs, edms_get_sub_docs  # Документи підлеглих

urlpatterns = [
  #  url(r'^$', RedirectView.as_view(url='/main', permanent=True)),
  #  url(r'^main/', edms_main, name='main'),


    url(r'^.+/get_doc/(?P<pk>\d+)/$', edms_get_doc, name='get_doc_info'),  # Запит на інформацію про документ
    url(r'^.+/get_deps/', edms_get_deps, name='get_deps'),  # Запит списку відділів
    url(r'^.+/get_seats/', edms_get_seats, name='get_seats'),  # Запит списку відділів

    url(r'^hr/emp/(?P<pk>\d+)/$', edms_hr_emp, name='hr_emp'),
    url(r'^hr/get_emp_seats/(?P<pk>\d+)/$', edms_get_emp_seats, name='hr_emp'),
    url(r'^hr/dep/(?P<pk>\d+)/$', edms_hr_dep, name='hr_dep'),
    url(r'^hr/seat/(?P<pk>\d+)/$', edms_hr_seat, name='hr_seat'),
    url(r'^hr/emp_seat/(?P<pk>\d+)/$', edms_hr_emp_seat, name='hr_seat'),
    url(r'^hr/', edms_hr, name='hr'),

    url(r'^administration/get_types/(?P<pk>\d+)/$', edms_get_types, name='get_types'),
    url(r'^administration/deactivate/(?P<pk>\d+)/$', edms_deactivate_permission, name='deactivate_permission'),
    url(r'^administration/get_type_info/(?P<pk>\d+)/$', edms_get_type_info, name='get_type_info'),
    url(r'^administration/', edms_administration, name='administration'),

    url(r'^my_docs/get_drafts/', edms_get_drafts, name='my_docs_get_drafts'),
    url(r'^my_docs/get_chiefs/(?P<pk>\d+)/$', edms_get_chiefs, name='my_docs_get_chiefs'),
    url(r'^my_docs/get_direct_subs/(?P<pk>\d+)/$', edms_get_direct_subs, name='my_docs_get_direct_subs'),
    url(r'^my_docs/mark/', edms_mark, name='my_docs_mark'),
    url(r'^my_docs/resolution/', edms_resolution, name='my_docs_resolution'),
    url(r'^my_docs/', edms_my_docs, name='my_docs'),

    url(r'^archive/', edms_archive, name='archive'),

    url(r'^sub_docs/get/(?P<pk>\d+)/$', edms_get_sub_docs, name='get_sub_docs'),
    url(r'^sub_docs/', edms_sub_docs, name='sub_docs'),
]
