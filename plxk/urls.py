from django.conf.urls import url,include
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
    url(r'^logout/$', auth_views.logout,{'template_name': 'home.html'}, name='logout'),
    url(r'^login/$', auth_views.login, {'template_name': 'accounts/login.html'},name='login'),
    url(r'^phones/sort/(?P<pk>[0-9]+)$', board_views.phones, name='phones'),
    url(r'^polls/', include('polls.urls',namespace='polls')),
    url(r'^crm/', include('crm.urls',namespace='crm')),
    url(r'^bets/', include('bets.urls', namespace='bets')),
    url(r'^boards/', include('boards.urls', namespace='boards')),

    url(r'^docs/', include('docs.urls', namespace='docs')),
    url(r'^tickets/', include('tickets.urls', namespace='tickets')),
    url(r'^gi/', include('gi.urls', namespace='gi')),
    url(r'^departments/$',  accounts_views.departments, name='departments'),
    url(r'^department/(?P<pk>\d+)/$', accounts_views.department,name='department'),
    #url(r'^media/', include('docs.urls', namespace='docsm')),
    url(r'^admin/', admin.site.urls, name='sam_admin'),

    url(r'^edms/', include('edms.urls', namespace='edms')),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += staticfiles_urlpatterns()