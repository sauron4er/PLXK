from django import forms

from accounts import models as accounts
from .models import Seat, Employee_Seat, Document, Free_Time_Periods, Document_Path, Document_Flow, Carry_Out_Items, \
    Carry_Out_Info, Mark_Demand


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = accounts.UserProfile
        fields = ('pip', 'on_vacation', 'acting', 'is_active')


class EmployeeSeatForm(forms.ModelForm):
    class Meta:
        model = Employee_Seat
        fields = ('employee', 'seat', 'end_date', 'is_active', 'successor', 'is_main')


class DepartmentForm(forms.ModelForm):
    class Meta:
        model = accounts.Department
        fields = ('name', 'text', 'is_active')
        labels = {
            'name': 'Назва відділу',
            'text': 'Опис'
        }
        widgets = {'is_active': forms.HiddenInput()}    # невидиме поле


class SeatForm(forms.ModelForm):
    class Meta:
        model = Seat
        fields = ('seat', 'department', 'chief', 'is_active', 'is_free_time_chief', 'is_carry_out_chief')
        labels = {
            'seat': 'Назва посади',
            'department': 'Відділ',
            'chief': 'Керівник',
            'is_free_time_chief': 'Право підписувати звільнюючі перепустки',
            'is_carry_out_chief': 'Право підписувати матеріальні пропуски'
        }
        widgets = {'is_active': forms.HiddenInput()}    # невидиме поле


class DocumentForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = {'document_type', 'text', 'employee_seat'}


class FreeTimeForm(forms.ModelForm):
    class Meta:
        model = Free_Time_Periods
        fields = {'document', 'free_day'}


class CarryOutItemsForm(forms.ModelForm):
    class Meta:
        model = Carry_Out_Items
        fields = {'document', 'item_name', 'quantity', 'measurement'}


class CarryOutInfoForm(forms.ModelForm):
    class Meta:
        model = Carry_Out_Info
        fields = {'document', 'carry_out_day', 'gate'}


class DocumentPathForm(forms.ModelForm):
    class Meta:
        model = Document_Path
        fields = {'document', 'employee_seat', 'mark', 'comment'}


class DocumentFlowForm(forms.ModelForm):  # Для деактивації записів у flow
    class Meta:
        model = Document_Flow
        fields = {'is_active'}


class ChiefMarkDemandForm(forms.ModelForm):
    class Meta:
        model = Mark_Demand
        fields = {'document', 'recipient', 'mark'}


class ResolutionForm(forms.ModelForm):
    class Meta:
        model = Mark_Demand
        fields = {'document', 'document_path', 'comment', 'recipient', 'mark'}

