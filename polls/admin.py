from django.contrib import admin
from .models import Question, Choice

class ChoicheInLine(admin.TabularInline):
    model = Choice
    extra = 4

class QeustionAdmin(admin.ModelAdmin):
    fieldsets = [
        (None,               {'fields': ['question_text','question_type']}),
        ('Date information', {'fields': ['pub_date'], 'classes': ['collapse']}),
    ]
    inlines = [ChoicheInLine]
    list_display = ('question_text','pub_date','was_published_recently')
    list_filter = ['pub_date']
    search_fields = ['question_text']
admin.site.register(Question,QeustionAdmin)
#admin.site.register(Choice)