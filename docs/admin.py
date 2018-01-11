from django.contrib import admin
from .models import Doc_type,Document, Doc_group

admin.site.register(Doc_type)
admin.site.register(Doc_group)
admin.site.register(Document)
