from django import forms
from .models import Document, Order_doc


class NewDocForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = ['name', 'code', 'doc_type', 'doc_group', 'doc_file', 'actuality', 'author', 'responsible', 'date_start',
                  # 'is_active'
                  ]
        labels = {'name': 'Назва',
                  'code': 'Код',
                  'doc_type': 'Тип',
                  'doc_group': 'Група',
                  'doc_file': '',
                  'actuality': 'Актуальність',
                  'author': 'Автор',
                  'responsible': 'Відповідальний',
                  'date_start': 'Діє з',
                  # 'is_active' :'Активність'
                  }


class NewDocOrderForm(forms.ModelForm):
    class Meta:
        model = Order_doc
        fields = ['name', 'code', 'doc_type', 'created_by', 'author', 'responsible', 'supervisory', 'date_start',
                  'cancels_code', 'date_canceled', 'cancels'
                  ]
        # labels = {'name': 'Назва',
        #           'code': 'Код',
        #           'doc_type': 'Тип',
        #           'author': 'Автор',
        #           'responsible': 'Відповідальний',
        #           'date_start': 'Діє з',
        #           }


class CancelOrderForm(forms.ModelForm):
    class Meta:
        model = Order_doc
        fields = ['date_canceled', 'canceled_by']


class DeactivateOrderForm(forms.ModelForm):
    class Meta:
        model = Order_doc
        fields = ['is_act']
