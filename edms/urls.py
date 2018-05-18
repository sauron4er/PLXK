from django.conf.urls import include, url
from django.views.generic import RedirectView

# Custom:
from edms.views import edms_main, edms_hr

urlpatterns = [
  #  url(r'^$', RedirectView.as_view(url='/main', permanent=True)),
    url(r'^main/', edms_main, name='main'),
    url(r'^hr/', edms_hr, name='hr'),
]
