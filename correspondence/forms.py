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
