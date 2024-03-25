from django.urls import re_path
from hr.views import get_regulations, get_instructions, instructions, add_or_change_regulation, deact_regulation, \
    add_or_change_instruction, get_regulation, get_instruction, get_deps_for_regulations, get_dep_seats_for_instruction, \
    deact_instruction, org_structure, post_department, get_seat, dep_name_change
# from hr.views_org_structure import get_seat_info, post_instruction, org_structure

app_name = 'hr'

urlpatterns = [
    re_path(r'^instructions/get_regulations', get_regulations, name='get_regulations'),
    re_path(r'^instructions/get_instructions', get_instructions, name='get_instructions'),

    re_path(r'^instructions/get_deps_for_regulations', get_deps_for_regulations, name='get_deps_for_regulations'),
    re_path(r'^instructions/get_dep_seats_for_instruction/(?P<dep_id>\d+)', get_dep_seats_for_instruction, name='get_dep_seats_for_instruction'),

    re_path(r'^instructions/post_regulation/(?P<pk>\d+)$', add_or_change_regulation, name='add_or_change_regulation'),
    re_path(r'^instructions/post_instruction/(?P<pk>\d+)$', add_or_change_instruction, name='add_or_change_instruction'),

    re_path(r'^instructions/get_regulation/(?P<pk>\d+)$', get_regulation, name='get_regulation'),
    re_path(r'^instructions/get_instruction/(?P<pk>\d+)$', get_instruction, name='get_instruction'),

    re_path(r'^instructions/deact_regulation/(?P<pk>\d+)$', deact_regulation, name='deact_regulation'),
    re_path(r'^instructions/deact_instruction/(?P<pk>\d+)$', deact_instruction, name='deact_instruction'),

    re_path(r'^instructions/', instructions, name='instructions'),

    # re_path(r'^org_structure/get_seat_info/(?P<pk>\d+)/$', get_seat_info, name='get_seat_info'),
    re_path(r'^org_structure/post_department/', post_department, name='post_department'),
    re_path(r'^org_structure/get_seat/(?P<pk>\d+)$', get_seat, name='get_seat'),
    re_path(r'^org_structure/dep_name_change/(?P<pk>\d+)/(?P<new_name>\w+)$', dep_name_change, name='get_seat'),
    re_path(r'^org_structure/', org_structure, name='org_structure'),
]
