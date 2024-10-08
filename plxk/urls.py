from django.urls import re_path, include
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from accounts import views as accounts_views
from boards import views as board_views
from boards.views_counterparties import get_counterparties, get_clients_for_product_type
from boards.views_permissions import permissions, get_permissions, get_permission, post_permission
from boards.views_proposals import proposals, get_proposals, post_proposal, get_proposal
from production.views import get_products, get_product_types_flat, get_products_for_product_type, get_permission_categories
from docs.views_contracts import edit_contract, get_additional_contracts
from edms.views import edms_get_emp_seats, edms_get_documents, edms_get_doc, get_dep_seats, get_seats_for_select


urlpatterns = [
    re_path(r'^.+/.+/get_product_types_flat/(?P<direction>\w+)', get_product_types_flat, name='get_product_types'),
    re_path(r'^.+/.+/get_products/(?P<product_type_id>\d+)', get_products_for_product_type, name='get_products_for_product_type'),
    re_path(r'^.+/.+/get_clients/(?P<product_type>\d+)', get_clients_for_product_type, name='clients'),
    re_path(r'^.+/.+/get_clients$', get_clients_for_product_type, name='clients'),
    re_path(r'^.+/.+/get_counterparties/(?P<cp_type>\w+)', get_counterparties, name='get_counterparties'),
    re_path(r'^.+/.+/get_counterparties', get_counterparties, name='get_counterparties'),
    re_path(r'^.+/.+/get_providers_list', get_counterparties, {'cp_type': 'providers'}, name='get_providers_list'),
    re_path(r'^.+/.+/get_user_profiles', accounts_views.get_user_profiles_for_select, name='get_user_profiles_for_select'),
    re_path(r'^.+/get_user_profiles', accounts_views.get_user_profiles_for_select, name='get_user_profiles_for_select'),
    re_path(r'^.+/.+/get_employees', edms_get_emp_seats, name='get_employees'),
    re_path(r'^.+/get_employees', edms_get_emp_seats, name='get_employees'),
    re_path(r'^.+/.+/get_userprofiles', board_views.get_userprofiles, name='get_userprofiles_list'),
    re_path(r'^.+/get_userprofiles', board_views.get_userprofiles, name='get_userprofiles_list'),
    re_path(r'^.+/.+/get_dep_seats/(?P<dep_id>\d+)', get_dep_seats, name='get_dep_seats'),
    re_path(r'^.+/.+/get_seats_for_select', get_seats_for_select, name='get_seats_for_select'),
    re_path(r'^.+/.+/get_departments/(?P<company>\w+)', accounts_views.get_departments, name='get_departments_for_select'),
    re_path(r'^.+/.+/get_departments', accounts_views.get_departments, name='get_departments_for_select'),
    re_path(r'^.+/get_departments', accounts_views.get_departments, name='get_departments_for_select'),
    re_path(r'^.+/.+/get_dep_chief_seat/(?P<dep_id>\d+)/$', accounts_views.get_dep_chief_seat, name='get_dep_chief_seat'),
    re_path(r'^.+/.+/get_edms_documents/(?P<counterparty_id>\d+)/$', edms_get_documents, name='get_edms_documents'),
    re_path(r'^.+/.+/get_doc/(?P<pk>\d+)/$', edms_get_doc, name='get_doc_info'),  # Запит на інформацію про документ
    re_path(r'^.+/get_doc/(?P<pk>\d+)/$', edms_get_doc, name='get_doc_info'),  # Запит на інформацію про документ
    re_path(r'^.+/.+/edit_contract', edit_contract, name='edit_contract'),
    re_path(r'^.+/.+/get_additional_contracts/(?P<pk>\d+)/$', get_additional_contracts, name='get_additional_contracts'),

    re_path(r'^$', board_views.home, name='index'),
   # re_path(r'^about/$', views.about, name='about'),
    re_path(r'^home/$', board_views.home, name='home'),
    re_path(r'^signup/$', accounts_views.signup, name='signup'),
    re_path(r'^logout/$', auth_views.LogoutView.as_view(), {'template_name': 'home.html'}, name='logout'),
    re_path(r'^login/$', auth_views.LoginView.as_view(), {'template_name': 'accounts/login.html'}, name='login'),
    re_path(r'^menu/', board_views.menu, name='menu'),
    re_path(r'^polls/', include('polls.urls', namespace='polls')),
    re_path(r'^crm/', include('crm.urls', namespace='crm')),
    re_path(r'^boards/', include('boards.urls', namespace='boards')),
    re_path(r'^ordering/', include('ordering.urls', namespace='ordering')),
    re_path(r'^hr/', include('hr.urls', namespace='hr')),
    re_path(r'^reload/', board_views.reload, name='reload'),  # Якщо запит на 'boards/reload' - повертається пустий response

    re_path(r'^docs/', include('docs.urls', namespace='docs')),
    re_path(r'^correspondence/', include('correspondence.urls', namespace='correspondence')),
    re_path(r'^production/', include('production.urls', namespace='production')),
    re_path(r'^tickets/', include('tickets.urls', namespace='tickets')),
    re_path(r'^gi/', include('gi.urls', namespace='gi')),
    re_path(r'^departments/$',  accounts_views.departments, name='departments'),
    re_path(r'^department/(?P<pk>\d+)/$', accounts_views.department, name='department'),
    #re_path(r'^media/', include('docs.urls', namespace='docsm')),
    re_path(r'^admin/', admin.site.urls, name='sam_admin'),

    re_path(r'^edms/', include('edms.urls', namespace='edms')),
    re_path(r'^accounts/', include('accounts.urls', namespace='accounts')),

    re_path(r'^phones/change_pam', board_views.change_pam, name='change_pam'),
    re_path(r'^phones/add_external_phone', board_views.add_external_phone, name='add_external_phone'),
    re_path(r'^phones/edit_external_phone', board_views.edit_external_phone, name='edit_external_phone'),
    re_path(r'^phones/', board_views.phones, name='phones'),

    re_path(r'^foyer/get_foyer_data/(?P<page>\d+)/$', board_views.get_foyer_data, name='get_foyer_data'),
    re_path(r'^foyer/create_report', board_views.create_foyer_report, name='create_foyer_report'),
    re_path(r'^foyer/', board_views.foyer, name='foyer'),

    re_path(r'^permissions/get_permission_categories', get_permission_categories, name='get_permission_categories'),
    re_path(r'^permissions/get_permissions/(?P<page>\d+)/$', get_permissions, name='get_permissions'),
    re_path(r'^permissions/get_permission/(?P<pk>\d+)/$', get_permission, name='get_permissions'),
    re_path(r'^permissions/post_permission/$', post_permission, name='post_permission'),
    re_path(r'^permissions/', permissions, name='permissions'),

    re_path(r'^proposals/get_proposals/(?P<page>\d+)/$', get_proposals, name='get_proposals'),
    re_path(r'^proposals/get_proposal/(?P<pk>\d+)/$', get_proposal, name='get_proposal'),
    re_path(r'^proposals/add_proposal/$', post_proposal, name='add_proposal'),
    re_path(r'^proposals/', proposals, name='proposals'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += staticfiles_urlpatterns()
