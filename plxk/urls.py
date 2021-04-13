from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from accounts import views as accounts_views
from boards import views as board_views


urlpatterns = [
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

    url(r'^phones/change_pam', board_views.change_pam, name='change_pam'),
    url(r'^phones/', board_views.phones, name='phones'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += staticfiles_urlpatterns()
