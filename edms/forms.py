from django import forms

from django.contrib.auth.models import User
from accounts import models as accounts
from .models import Seat, Employee_Seat


class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('last_name', 'first_name', 'is_active')


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = accounts.UserProfile
        fields = ('pip', 'user', 'on_vacation', 'acting', 'is_active')


class EmployeeSeatForm(forms.ModelForm):
    class Meta:
        model = Employee_Seat
        fields = ('employee', 'seat', 'begin_date', 'end_date', 'is_active')


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

    # def __init__(self, *args, **kwargs):                # поле "керівник"
    #     super(DepartmentForm, self).__init__(*args, **kwargs)
    #     manager_list = accounts.User.objects.all()
    #     managers = [(i.id, (i.last_name + ' ' + i.first_name)) for i in manager_list]
    #     self.fields['manager'] = forms.ChoiceField(choices=managers)
    #     self.fields['manager'].label = 'Керівник'
    #     self.fields['manager'].required = False


class SeatForm(forms.ModelForm):
    class Meta:
        model = Seat
        fields = ('seat', 'department', 'chief', 'is_active')
        labels = {
            'seat': 'Назва посади',
            'department': 'Відділ',
            'chief': 'Керівник'
        }
        widgets = {'is_active': forms.HiddenInput()}    # невидиме поле
