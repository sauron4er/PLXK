from django.conf.urls import url
from .views import employees, save_employee, deact_employee, vacations, get_vacations, edit_vacation, del_vacation

app_name = 'accounts'

urlpatterns = [
    url(r'^employees/save_employee', save_employee, name='save_employee'),
    url(r'^employees/deact_employee/(?P<pk>\d+)$', deact_employee, name='deact_employee'),
    url(r'^employees/', employees, name='employees'),

    url(r'^vacations/edit_vacation', edit_vacation, name='edit_vacation'),
    url(r'^vacations/del_vacation', del_vacation, name='deactivate_vacation'),
    url(r'^vacations/get_vacations', get_vacations, name='get_vacations'),
    url(r'^vacations/', vacations, name='vacations'),
]
