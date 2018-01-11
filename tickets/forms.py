from django import forms
from .models import Ticket,Ticket_content

class NewTicketForm(forms.ModelForm):
    text = forms.CharField(
        widget=forms.Textarea(
            attrs={'rows':5,'placeholder':'Введіть повідомлення(до 4000 символів)'}
        ),
        max_length=4000,
        label='Опис проблеми'
        )

    class Meta:
        model = Ticket
        fields = ['group','priority','text','doc_file']
        labels = {'group':'Тип',
                  'priority':'Пріоритетність',
                  'doc_file':'Файл'
                  }

class NewTicketContentForm(forms.ModelForm):
    text = forms.CharField(
        widget=forms.Textarea(
            attrs={'rows':2,'placeholder':'Прокоментуйте'}
        ),
        max_length=4000,
        label='Коментар'
        )

    class Meta:
        model = Ticket_content
        fields = ['text','state']
        labels = {'state':'Статус',}