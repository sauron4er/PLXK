from django.contrib import admin
from .models import Doc_type,Document, Doc_group, Order_doc, Order_doc_type

admin.site.register(Doc_type)
admin.site.register(Doc_group)
admin.site.register(Document)
admin.site.register(Order_doc)
admin.site.register(Order_doc_type)