from django import forms

from accounts import models as accounts
from .models import Seat


class DepartmentForm(forms.ModelForm):
    class Meta:
        model = accounts.Department
        fields = ('name', 'text', 'manager')
