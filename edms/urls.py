from django.conf.urls import include, url
from django.views.generic import RedirectView

# Custom:
from edms.views import edms_main, edms_hr, edms_hr_dep, edms_hr_seat

urlpatterns = [
  #  url(r'^$', RedirectView.as_view(url='/main', permanent=True)),
    url(r'^main/', edms_main, name='main'),
    url(r'^hr/dep/(?P<pk>\d+)/$', edms_hr_dep, name='hr_dep'),
    url(r'^hr/seat/(?P<pk>\d+)/$', edms_hr_seat, name='hr_seat'),
    url(r'^hr/', edms_hr, name='hr'),
]
