from django import forms

from accounts import models as accounts
from .models import Seat


class DepartmentForm(forms.ModelForm):
    class Meta:
        model = accounts.Department
        fields = ('name', 'text', 'manager', 'is_active')
        labels = {
            'name': 'Назва відділу',
            'text': 'Опис',
            'manager': 'Керівник'
        }
        widgets = {'is_active': forms.HiddenInput()}    # невидиме поле
