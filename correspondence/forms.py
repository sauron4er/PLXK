from django import forms
from .models import Client, Law, Request, Request_law


class NewClientForm(forms.ModelForm):
    class Meta:
        model = Client
        fields = ['name']


class DelClientForm(forms.ModelForm):
    class Meta:
        model = Client
        fields = ['is_active']


class NewLawForm(forms.ModelForm):
    class Meta:
        model = Law
        fields = ['name', 'url']


class DelLawForm(forms.ModelForm):
    class Meta:
        model = Law
        fields = ['is_active']


class NewRequestForm(forms.ModelForm):
    class Meta:
        model = Request
        # fields = ['product_type', 'client', 'request_date', 'responsible', 'answer_responsible']
        fields = ['product_type', 'client', 'request_date', 'responsible',
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
