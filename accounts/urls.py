from django.urls import re_path
from .views import employees, save_employee, deact_employee, \
    vacations, get_vacations, edit_vacation, finish_vacation, del_vacation, arrange_vacations

app_name = 'accounts'

urlpatterns = [
    re_path(r'^employees/save_employee', save_employee, name='save_employee'),
    re_path(r'^employees/deact_employee/(?P<pk>\d+)$', deact_employee, name='deact_employee'),
    re_path(r'^employees/', employees, name='employees'),

    re_path(r'^vacations/edit_vacation', edit_vacation, name='edit_vacation'),
    re_path(r'^vacations/finish_vacation', finish_vacation, name='finish_vacation'),
    re_path(r'^vacations/del_vacation', del_vacation, name='deactivate_vacation'),
    re_path(r'^vacations/get_vacations', get_vacations, name='get_vacations'),
    re_path(r'^vacations/arrange_vacations', arrange_vacations, name='arrange_vacations'),
    re_path(r'^vacations/', vacations, name='vacations'),
]
