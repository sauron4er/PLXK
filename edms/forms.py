from django import forms

from accounts import models as accounts
from .models import Seat, Employee_Seat, Document, Free_Time_Periods, Document_Path, Carry_Out_Items, Carry_Out_Info, \
    Mark_Demand, Document_Type_Permission, File, Decree, Doc_Article, Doc_Article_Dep, Doc_Approval


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
        fields = ('seat', 'department', 'chief', 'is_active')
        labels = {
            'seat': 'Назва посади',
            'department': 'Відділ',
            'chief': 'Керівник',
        }
        widgets = {'is_active': forms.HiddenInput()}    # невидиме поле


class DocumentForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = {'document_type', 'text', 'employee_seat', 'is_draft'}


#  Видалення документа (не буде показуватися в архівах)
class CloseDocForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = {'closed'}


# Document Type Permission Deactivate Form
class DTPDeactivateForm(forms.ModelForm):
    class Meta:
        model = Document_Type_Permission
        fields = {'is_active'}


# Document Type Permission Add Form
class DTPAddForm(forms.ModelForm):
    class Meta:
        model = Document_Type_Permission
        fields = {'document_type', 'seat', 'mark'}


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


class ChiefMarkDemandForm(forms.ModelForm):
    class Meta:
        model = Mark_Demand
        fields = {'document', 'recipient', 'mark'}


class ResolutionForm(forms.ModelForm):
    class Meta:
        model = Mark_Demand
        fields = {'document', 'document_path', 'comment', 'recipient', 'mark'}


class NewFileForm(forms.ModelForm):
    class Meta:
        model = File
        fields = {
            'name',
            'file',
            'document_path'
        }


class NewDecreeForm(forms.ModelForm):
    class Meta:
        model = Decree
        fields = {
            'document',
            'name',
            'preamble',
        }


class NewArticleForm(forms.ModelForm):  # пункти наказів чи інших документів
    class Meta:
        model = Doc_Article
        fields = {
            'document',
            'text',
            'deadline',
        }


class NewArticleDepForm(forms.ModelForm):  # пункти наказів чи інших документів
    class Meta:
        model = Doc_Article_Dep
        fields = {
            'article',
            'department',
        }


class NewApprovalForm(forms.ModelForm):  # людинопосади, які повинні погодити документ перед підписом
    class Meta:
        model = Doc_Approval
        fields = {
            'document',
            'seat',
        }
