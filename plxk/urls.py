from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from accounts import views as accounts_views
from boards import views as board_views
from production.views import get_products, get_product_types_flat, get_products_for_product_type, get_permission_categories
from boards.views_counterparties import get_counterparties, get_clients_for_product_type
from docs.views_contracts import edit_contract, get_additional_contracts
from edms.views import edms_get_emp_seats, edms_get_doc, get_dep_seats, get_seats_for_select


urlpatterns = [
    url(r'^.+/.+/get_product_types_flat/(?P<direction>\w+)', get_product_types_flat, name='get_product_types'),
    url(r'^.+/.+/get_products/(?P<product_type_id>\d+)', get_products_for_product_type, name='get_products_for_product_type'),
    url(r'^.+/.+/get_clients$', get_clients_for_product_type, name='clients'),
    url(r'^.+/.+/get_counterparties/(?P<cp_type>\w+)', get_counterparties, name='get_counterparties'),
    url(r'^.+/.+/get_counterparties', get_counterparties, name='get_counterparties'),
    url(r'^.+/.+/get_providers_list', get_counterparties, {'cp_type': 'providers'}, name='get_providers_list'),
    url(r'^.+/.+/get_user_profiles', accounts_views.get_user_profiles_for_select, name='get_user_profiles_for_select'),
    url(r'^.+/.+/get_employees', edms_get_emp_seats, name='get_employees'),
    url(r'^.+/.+/get_dep_seats/(?P<dep_id>\d+)', get_dep_seats, name='get_dep_seats'),
    url(r'^.+/.+/get_seats_for_select', get_seats_for_select, name='get_seats_for_select'),
    url(r'^.+/.+/get_departments', accounts_views.get_departments, name='get_departments_for_select'),
    url(r'^.+/.+/get_dep_chief_seat/(?P<dep_id>\d+)/$', accounts_views.get_dep_chief_seat, name='get_dep_chief_seat'),
    url(r'^.+/get_doc/(?P<pk>\d+)/$', edms_get_doc, name='get_doc_info'),  # Запит на інформацію про документ
    url(r'^.+/.+/get_doc/(?P<pk>\d+)/$', edms_get_doc, name='get_doc_info'),  # Запит на інформацію про документ
    url(r'^.+/.+/edit_contract', edit_contract, name='edit_contract'),
    url(r'^.+/.+/get_additional_contracts/(?P<pk>\d+)/$', get_additional_contracts, name='get_additional_contracts'),

    url(r'^$', board_views.home, name='index'),
   # url(r'^about/$', views.about, name='about'),
    url(r'^home/$', board_views.home, name='home'),
    url(r'^signup/$', accounts_views.signup, name='signup'),
    url(r'^logout/$', auth_views.LogoutView.as_view(), {'template_name': 'home.html'}, name='logout'),
    url(r'^login/$', auth_views.LoginView.as_view(), {'template_name': 'accounts/login.html'}, name='login'),
    url(r'^menu/', board_views.menu, name='menu'),
    url(r'^polls/', include('polls.urls', namespace='polls')),
    url(r'^crm/', include('crm.urls', namespace='crm')),
    url(r'^boards/', include('boards.urls', namespace='boards')),
    url(r'^ordering/', include('ordering.urls', namespace='ordering')),
    url(r'^hr/', include('hr.urls', namespace='hr')),
    url(r'^reload/', board_views.reload, name='reload'),  # Якщо запит на 'boards/reload' - повертається пустий response

    url(r'^docs/', include('docs.urls', namespace='docs')),
    url(r'^correspondence/', include('correspondence.urls', namespace='correspondence')),
    url(r'^production/', include('production.urls', namespace='production')),
    url(r'^tickets/', include('tickets.urls', namespace='tickets')),
    url(r'^gi/', include('gi.urls', namespace='gi')),
    url(r'^departments/$',  accounts_views.departments, name='departments'),
    url(r'^department/(?P<pk>\d+)/$', accounts_views.department, name='department'),
    #url(r'^media/', include('docs.urls', namespace='docsm')),
    url(r'^admin/', admin.site.urls, name='sam_admin'),

    url(r'^edms/', include('edms.urls', namespace='edms')),
    url(r'^accounts/', include('accounts.urls', namespace='accounts')),

    url(r'^phones/change_pam', board_views.change_pam, name='change_pam'),
    url(r'^phones/', board_views.phones, name='phones'),

    url(r'^foyer/get_foyer_data/(?P<page>\d+)/$', board_views.get_foyer_data, name='get_foyer_data'),
    url(r'^foyer/create_report', board_views.create_foyer_report, name='create_foyer_report'),
    url(r'^foyer/', board_views.foyer, name='foyer'),

    url(r'^permissions/get_permission_categories', get_permission_categories, name='get_permission_categories'),
    url(r'^permissions/', board_views.permissions, name='permissions'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += staticfiles_urlpatterns()
