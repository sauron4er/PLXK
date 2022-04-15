from django.conf.urls import url
from hr.views import get_regulations, get_instructions, instructions, add_or_change_regulation, deact_regulation, \
    add_or_change_instruction, get_regulation, get_instruction, get_deps_for_regulations, get_dep_seats_for_instruction

app_name = 'hr'

urlpatterns = [
    url(r'^instructions/get_regulations', get_regulations, name='get_regulations'),
    url(r'^instructions/get_instructions', get_instructions, name='get_instructions'),

    url(r'^instructions/get_deps_for_regulations', get_deps_for_regulations, name='get_deps_for_regulations'),
    url(r'^instructions/get_dep_seats_for_instruction/(?P<dep_id>\d+)', get_dep_seats_for_instruction, name='get_dep_seats_for_instruction'),

    url(r'^instructions/post_regulation/(?P<pk>\d+)$', add_or_change_regulation, name='add_or_change_regulation'),
    url(r'^instructions/post_instruction/(?P<pk>\d+)$', add_or_change_instruction, name='add_or_change_instruction'),

    url(r'^instructions/get_regulation/(?P<pk>\d+)$', get_regulation, name='get_regulation'),
    url(r'^instructions/get_instruction/(?P<pk>\d+)$', get_instruction, name='get_instruction'),

    url(r'^instructions/deact_regulation/(?P<pk>\d+)$', deact_regulation, name='deact_regulation'),

    url(r'^instructions/', instructions, name='instructions'),



]
