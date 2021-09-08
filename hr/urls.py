from django.conf.urls import url
from hr import views

app_name = 'hr'

urlpatterns = [
    url(r'^instructions/get_regulations/(?P<page>\d+)/$', views.get_regulations, name='get_regulations'),
    url(r'^instructions/get_instructions/(?P<page>\d+)/$', views.get_instructions, name='get_instructions'),
    url(r'^instructions/', views.instructions, name='instructions'),

]
