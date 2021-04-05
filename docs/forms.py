from django import forms
from .models import Document, Order_doc, Order_article, Article_responsible, Contract, Contract_File


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
        fields = ['name', 'code', 'doc_type', 'created_by', 'author', 'supervisory', 'date_start',
                  'cancels_code', 'date_canceled', 'cancels'
                  ]


class CancelOrderForm(forms.ModelForm):
    class Meta:
        model = Order_doc
        fields = ['date_canceled', 'canceled_by']


class DeactivateOrderForm(forms.ModelForm):
    class Meta:
        model = Order_doc
        fields = ['is_act', 'updated_by', 'updated_at']


class OrderDoneForm(forms.ModelForm):
    class Meta:
        model = Order_doc
        fields = ['done']


class NewArticleForm(forms.ModelForm):
    class Meta:
        model = Order_article
        fields = ['order', 'text', 'deadline', 'periodicity', 'term']


class ArticleDoneForm(forms.ModelForm):
    class Meta:
        model = Order_article
        fields = ['done']


class DeactivateArticleForm(forms.ModelForm):
    class Meta:
        model = Order_article
        fields = ['is_active']


class NewResponsibleForm(forms.ModelForm):
    class Meta:
        model = Article_responsible
        fields = ['article', 'employee_seat', 'comment', 'done']


class ResponsibleDoneForm(forms.ModelForm):
    class Meta:
        model = Order_article
        fields = ['done']


class DeactivateResponsibleForm(forms.ModelForm):
    class Meta:
        model = Order_article
        fields = ['is_active']


#  --------------------------------------------------------- Contracts
class NewContractForm(forms.ModelForm):
    class Meta:
        model = Contract
        fields = ['number', 'subject', 'counterparty_link', 'nomenclature_group', 'company', 'incoterms', 'purchase_terms',
                  'date_start', 'date_end', 'responsible', 'department', 'lawyers_received', 'basic_contract']
        # created_by, edms_doc змушений додавати у форму напряму у views, через цю форму каже, що поле не заповнене


class DeactivateContractForm(forms.ModelForm):
    class Meta:
        model = Contract
        fields = ['is_active']


class DeactivateContractFileForm(forms.ModelForm):
    class Meta:
        model = Contract_File
        fields = ['is_active']
