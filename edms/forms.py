from django import forms

from accounts import models as accounts
from .models import Seat, Employee_Seat, Document, Document_Path, Carry_Out_Items, Mark_Demand, \
    Document_Type_Permission
from .models import File, Doc_Article, Doc_Article_Dep, Doc_Approval, Doc_Day, Doc_Name, Doc_Type_Unique_Number, \
    Doc_Preamble, Doc_Sign, Doc_Validity, Doc_Text, Doc_Recipient, Doc_Gate


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
        # labels = {
        #     'name': 'Назва відділу',
        #     'text': 'Опис'
        # }
        # widgets = {'is_active': forms.HiddenInput()}    # невидиме поле


class SeatForm(forms.ModelForm):
    class Meta:
        model = Seat
        fields = ('seat', 'department', 'chief', 'is_dep_chief', 'is_active')
        # labels = {
        #     'seat': 'Назва посади',
        #     'department': 'Відділ',
        #     'chief': 'Керівник',
        # }
        # widgets = {'is_active': forms.HiddenInput()}    # невидиме поле


class DocumentForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = {'document_type', 'text', 'employee_seat', 'is_draft', 'testing'}


#  Деактивація документа (буде показуватися в архівах)
class DeactivateDocForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = {'is_active'}


#  Видалення документа (не буде показуватися в архівах)
class DeleteDocForm(forms.ModelForm):
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


class DocumentPathForm(forms.ModelForm):
    class Meta:
        model = Document_Path
        fields = {'document', 'employee_seat', 'mark', 'comment'}


class MarkDemandForm(forms.ModelForm):
    class Meta:
        model = Mark_Demand
        fields = {'document', 'recipient', 'mark', 'document_path', 'phase', 'comment'}


class DeactivateMarkDemandForm(forms.ModelForm):
    class Meta:
        model = Mark_Demand
        fields = {'is_active'}


class ResolutionForm(forms.ModelForm):
    class Meta:
        model = Mark_Demand
        fields = {'document', 'recipient', 'mark', 'document_path', 'phase', 'comment'}


# --------------------------------------------------------------------------------------------------------------------
# Форми модульної системи ЕДО

class NewFileForm(forms.ModelForm):
    class Meta:
        model = File
        fields = {'name', 'file', 'document_path'}


class FileNewPathForm(forms.ModelForm):
    class Meta:
        model = File
        fields = {'document_path'}


class NewArticleForm(forms.ModelForm):
    class Meta:
        model = Doc_Article
        fields = {'document', 'text', 'deadline'}


class NewArticleDepForm(forms.ModelForm):
    class Meta:
        model = Doc_Article_Dep
        fields = {'article', 'department'}


class NewApprovalForm(forms.ModelForm):
    class Meta:
        model = Doc_Approval
        fields = {'document', 'seat'}


class NewNameForm(forms.ModelForm):
    class Meta:
        model = Doc_Name
        fields = {'document', 'name'}


class NewPreambleForm(forms.ModelForm):
    class Meta:
        model = Doc_Preamble
        fields = {'document', 'preamble'}


class NewTextForm(forms.ModelForm):
    class Meta:
        model = Doc_Text
        fields = {'document', 'text'}


class NewRecipientForm(forms.ModelForm):
    class Meta:
        model = Doc_Recipient
        fields = {'document', 'recipient'}


class NewDayForm(forms.ModelForm):
    class Meta:
        model = Doc_Day
        fields = {'document', 'day'}


class NewGateForm(forms.ModelForm):
    class Meta:
        model = Doc_Gate
        fields = {'document', 'gate'}


class CarryOutItemsForm(forms.ModelForm):
    class Meta:
        model = Carry_Out_Items
        fields = {'document', 'item_name', 'quantity', 'measurement'}
