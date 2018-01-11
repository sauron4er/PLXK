from django.contrib import admin
from .models import Ticket,Group, State, Ticket_content, Priority

admin.site.register(Ticket)
admin.site.register(Ticket_content)
admin.site.register(Group)
admin.site.register(State)
admin.site.register(Priority)