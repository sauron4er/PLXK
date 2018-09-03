from django.conf.urls import include, url

from edms.views import edms_hr, edms_hr_emp, edms_hr_dep, edms_hr_seat, edms_hr_emp_seat  # Відділ кадрів
from edms.views import edms_my_docs, edms_get_doc, edms_mark  # Мої документи
from edms.views import edms_archive  # Архів
from edms.views import edms_sub_docs, edms_get_sub_docs  # Документи підлеглих

urlpatterns = [
  #  url(r'^$', RedirectView.as_view(url='/main', permanent=True)),
  #  url(r'^main/', edms_main, name='main'),
    url(r'^hr/emp/(?P<pk>\d+)/$', edms_hr_emp, name='hr_emp'),
    url(r'^hr/dep/(?P<pk>\d+)/$', edms_hr_dep, name='hr_dep'),
    url(r'^hr/seat/(?P<pk>\d+)/$', edms_hr_seat, name='hr_seat'),
    url(r'^hr/emp_seat/(?P<pk>\d+)/$', edms_hr_emp_seat, name='hr_seat'),
    url(r'^hr/', edms_hr, name='hr'),

    url(r'^my_docs/mark/', edms_mark, name='my_docs_mark'),
    url(r'^my_docs/get_doc/(?P<pk>\d+)/$', edms_get_doc, name='get_my_active_doc'),
    url(r'^my_docs/', edms_my_docs, name='my_docs'),

    url(r'^archive/get_doc/(?P<pk>\d+)/$', edms_get_doc, name='get_my_archive_doc'),
    url(r'^archive/', edms_archive, name='archive'),

    url(r'^sub_docs/get/(?P<pk>\d+)/$', edms_get_sub_docs, name='get_sub_docs'),
    url(r'^sub_docs/', edms_sub_docs, name='sub_docs'),
]
