from django.urls import re_path
from . import views

app_name = 'crm'

urlpatterns = [
    re_path(r'^$', views.index, name='index'),
    re_path(r'^gpaph/scales$', views.graph_scales, name='graph_scales'),
    re_path(r'^gpaph/woods$', views.graph_woods, name='graph_woods'),
    re_path(r'^gpaph/coals$', views.graph_coal, name='graph_coals'),
    re_path(r'^employee/sort/(?P<pk>[0-9]+)$', views.employee, name='employee'),
    #re_path(r'^(?P<pk>[0-9]+)/$', views.DetailView.as_view(), name='detail'),
    #re_path(r'^(?P<pk>[0-9]+)/results/$', views.ResultsView.as_view(), name='results'),
    #re_path(r'^(?P<question_id>[0-9]+)/vote/$', views.vote, name='vote'),
]