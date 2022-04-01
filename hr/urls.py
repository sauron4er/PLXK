from django.conf.urls import url
from hr.views import get_regulations, get_instructions, instructions, add_or_change_regulation, add_or_change_instruction

app_name = 'hr'

urlpatterns = [
    url(r'^instructions/get_regulations/(?P<page>\d+)/$', get_regulations, name='get_regulations'),
    url(r'^instructions/get_instructions/(?P<page>\d+)/$', get_instructions, name='get_instructions'),

    url(r'^instructions/post_regulation/(?P<pk>\d+)$', add_or_change_regulation, name='add_or_change_regulation'),
    url(r'^instructions/post_instruction/(?P<pk>\d+)$', add_or_change_instruction, name='add_or_change_instruction'),

    url(r'^instructions/', instructions, name='instructions'),



]
