from django.conf.urls import url
from hr.views import get_regulations, get_instructions, instructions, add_or_change_regulation, deact_regulation, \
    add_or_change_instruction, get_regulation, get_instruction, get_deps_for_regulations, get_dep_seats_for_instruction, \
    org_structure, post_department, get_seat, dep_name_change
# from hr.views_org_structure import get_seat_info, post_instruction, org_structure

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

    # url(r'^org_structure/get_seat_info/(?P<pk>\d+)/$', get_seat_info, name='get_seat_info'),
    url(r'^org_structure/post_department/', post_department, name='post_department'),
    url(r'^org_structure/get_seat/(?P<pk>\d+)$', get_seat, name='get_seat'),
    url(r'^org_structure/dep_name_change/(?P<pk>\d+)$', dep_name_change, name='get_seat'),
    url(r'^org_structure/', org_structure, name='org_structure'),
]
