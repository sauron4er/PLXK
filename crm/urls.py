from django.conf.urls import url
from . import views

app_name = 'crm'

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^gpaph/scales$', views.graph_scales, name='graph_scales'),
    url(r'^gpaph/woods$', views.graph_woods, name='graph_woods'),
    url(r'^gpaph/coals$', views.graph_coal, name='graph_coals'),
    url(r'^employee/sort/(?P<pk>[0-9]+)$', views.employee, name='employee'),
    #url(r'^(?P<pk>[0-9]+)/$', views.DetailView.as_view(), name='detail'),
    #url(r'^(?P<pk>[0-9]+)/results/$', views.ResultsView.as_view(), name='results'),
    #url(r'^(?P<question_id>[0-9]+)/vote/$', views.vote, name='vote'),
]