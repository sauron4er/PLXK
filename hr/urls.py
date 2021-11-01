from django.conf.urls import url
from hr.views import get_regulations, get_instructions, instructions, post_regulation, post_instruction

app_name = 'hr'

urlpatterns = [
    url(r'^instructions/get_regulations/(?P<page>\d+)/$', get_regulations, name='get_regulations'),
    url(r'^instructions/get_instructions/(?P<page>\d+)/$', get_instructions, name='get_instructions'),

    url(r'^instructions/post_regulation/(?P<pk>\d+)$', post_regulation, name='post_regulation'),
    url(r'^instructions/post_instruction/(?P<pk>\d+)$', post_instruction, name='post_instruction'),

    url(r'^instructions/', instructions, name='instructions'),



]
