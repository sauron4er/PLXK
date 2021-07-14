from django.conf.urls import url
from ordering import views

app_name = 'boards'

urlpatterns = [
    # url(r'^stationery/get_seat_info/(?P<pk>\d+)/$', views_org_structure.get_seat_info, name='get_seat_info'),
    url(r'^stationery/', views.stationery, name='stationery'),
]
