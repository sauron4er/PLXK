from django import forms
from .models import Client, Law, Law_file, Product_type, Request, Answer_file


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
