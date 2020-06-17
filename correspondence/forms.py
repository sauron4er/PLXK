from django import forms
from .models import Client, Law, Request, Request_law, Request_file, Scope, Law_scope


class NewClientForm(forms.ModelForm):
    class Meta:
        model = Client
        fields = ['name', 'country', 'product_type']


class DelClientForm(forms.ModelForm):
    class Meta:
        model = Client
        fields = ['is_active']


class NewScopeForm(forms.ModelForm):
    class Meta:
        model = Scope
        fields = ['name']


class DelScopeForm(forms.ModelForm):
    class Meta:
        model = Scope
        fields = ['is_active']


class NewLawForm(forms.ModelForm):
    class Meta:
        model = Law
        fields = ['name', 'url']


class DelLawForm(forms.ModelForm):
    class Meta:
        model = Law
        fields = ['is_active']


class NewLawScopeForm(forms.ModelForm):
    class Meta:
        model = Law_scope
        fields = ['law', 'scope']


class NewRequestForm(forms.ModelForm):
    class Meta:
        model = Request
        # fields = ['product_type', 'client', 'request_date', 'responsible', 'answer_responsible']
        fields = ['scope', 'client', 'request_date', 'responsible',
                  'answer_responsible', 'answer', 'request_term', 'answer_date']


class DeactivateRequestForm(forms.ModelForm):
    class Meta:
        model = Request
        fields = ['is_active']


class NewRequestLawForm(forms.ModelForm):
    class Meta:
        model = Request_law
        fields = ['request', 'law']


class DeactivateRequestLawForm(forms.ModelForm):
    class Meta:
        model = Request
        fields = ['is_active']


class DeactivateRequestFileForm(forms.ModelForm):
    class Meta:
        model = Request_file
        fields = ['is_active']


class DeactivateAnswerFileForm(forms.ModelForm):
    class Meta:
        model = Request_file
        fields = ['is_active']
