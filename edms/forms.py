from django import forms

from accounts import models as accounts
from .models import Seat, Employee_Seat, Document, Free_Time_Periods


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = accounts.UserProfile
        fields = ('pip', 'on_vacation', 'acting', 'is_active')


class EmployeeSeatForm(forms.ModelForm):
    class Meta:
        model = Employee_Seat
        fields = ('employee', 'seat', 'end_date', 'is_active')


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


# Форми для створення нової звільнюючої відпустки.
# Три окремі форми об’єднано в одну велику.
class DocumentForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = {'document_type', 'text', 'employee_seat'}


class FreeTimeForm(forms.ModelForm):
    class Meta:
        model = Free_Time_Periods
        fields = {'document', 'free_day'}
