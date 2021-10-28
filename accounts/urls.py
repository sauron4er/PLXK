from django.conf.urls import url
from .views import employees, save_employee, deact_employee

app_name = 'accounts'

urlpatterns = [
    url(r'^employees/save_employee', save_employee, name='save_employee'),
    url(r'^employees/deact_employee/(?P<pk>\d+)$', deact_employee, name='deact_employee'),
    url(r'^employees/', employees, name='employees'),
]
