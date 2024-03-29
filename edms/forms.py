from django import forms

from edms.models import *
from accounts.models import *


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ('pip', 'on_vacation', 'acting', 'is_active')


class UserVacationForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ('on_vacation', 'acting')


class EmployeeSeatForm(forms.ModelForm):
    class Meta:
        model = Employee_Seat
        fields = ('employee', 'seat', 'end_date', 'is_active', 'successor', 'is_main')


class ActingEmpSeatForm(forms.ModelForm):
    class Meta:
        model = Employee_Seat
        fields = ('employee', 'seat', 'begin_date', 'end_date', 'is_active', 'acting_for', 'is_main')


class DeactivateEmpSeatForm(forms.ModelForm):
    class Meta:
        model = Employee_Seat
        fields = ('end_date', 'is_active')


class DepartmentForm(forms.ModelForm):
    class Meta:
        model = accounts.Department
        fields = ('name', 'text', 'is_active')


class SeatForm(forms.ModelForm):
    class Meta:
        model = Seat
        fields = ('seat', 'department', 'chief', 'is_dep_chief', 'is_active')


class SeatInstructionForm(forms.ModelForm):
    class Meta:
        model = Seat
        fields = ('instructions_file',)


class DocumentForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = {'document_type', 'employee_seat', 'is_draft', 'is_template', 'testing', 'doc_type_version'}


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


class NewPathForm(forms.ModelForm):
    class Meta:
        model = Document_Path
        fields = {'document', 'employee_seat', 'mark', 'comment'}


class NewAnswerForm(forms.ModelForm):
    class Meta:
        model = Document_Path
        fields = {'document', 'employee_seat', 'mark', 'comment', 'path_to_answer'}


class MarkDemandForm(forms.ModelForm):
    class Meta:
        model = Mark_Demand
        fields = {'document', 'recipient', 'mark', 'document_path', 'phase', 'comment'}


class MarkDemandChangeRecipientForm(forms.ModelForm):
    class Meta:
        model = Mark_Demand
        fields = {'recipient'}


class DeactivateMarkDemandForm(forms.ModelForm):
    class Meta:
        model = Mark_Demand
        fields = {'is_active'}


class ResolutionForm(forms.ModelForm):
    class Meta:
        model = Mark_Demand
        fields = {'document', 'recipient', 'mark', 'document_path', 'phase', 'comment'}


class VacationForm(forms.ModelForm):
    class Meta:
        model = Vacation
        fields = {'employee', 'begin', 'end', 'acting', 'started'}


class StartVacationForm(forms.ModelForm):
    class Meta:
        model = Vacation
        fields = {'started'}


class DeactivateVacationForm(forms.ModelForm):
    class Meta:
        model = Vacation
        fields = {'is_active'}

# --------------------------------------------------------------------------------------------------------------------
# Форми модульної системи ЕДО

class NewFileForm(forms.ModelForm):
    class Meta:
        model = File
        fields = {'name', 'file', 'document_path', 'first_path'}


class FileNewPathForm(forms.ModelForm):
    class Meta:
        model = File
        fields = {'document_path'}


# class NewArticleForm(forms.ModelForm):
#     class Meta:
#         model = Doc_Article
#         fields = {'document', 'text', 'deadline'}


# class NewArticleDepForm(forms.ModelForm):
#     class Meta:
#         model = Doc_Article_Dep
#         fields = {'article', 'department'}


class NewAcquaintForm(forms.ModelForm):
    class Meta:
        model = Doc_Acquaint
        fields = {'document', 'acquaint_emp_seat'}


class NewApprovalForm(forms.ModelForm):
    class Meta:
        model = Doc_Approval
        fields = {'document', 'emp_seat', 'approve_queue'}


class ApprovedApprovalForm(forms.ModelForm):    # Deprecated Для створення запису відразу зі значенням True
    class Meta:
        model = Doc_Approval
        fields = {'document', 'emp_seat', 'approve_queue', 'approved', 'approve_path'}

        def __init__(self, *args, **kwargs):
            # """If no initial data, provide some defaults."""
            initial = kwargs.get('initial', {})
            initial['approved'] = None
            initial['approve_path'] = None
            kwargs['initial'] = initial


class ApproveForm(forms.ModelForm):
    class Meta:
        model = Doc_Approval
        fields = {'approved', 'approve_path'}


class DeactivateApproveForm(forms.ModelForm):
    class Meta:
        model = Doc_Approval
        fields = {'approved'}


# class NewNameForm(forms.ModelForm):
#     class Meta:
#         model = Doc_Name
#         fields = {'document', 'name'}


class NewTextForm(forms.ModelForm):
    class Meta:
        model = Doc_Text
        fields = {'document', 'text', 'queue_in_doc'}


class NewRecipientForm(forms.ModelForm):
    class Meta:
        model = Doc_Recipient
        fields = {'document', 'recipient'}


class NewDayForm(forms.ModelForm):
    class Meta:
        model = Doc_Day
        fields = {'document', 'day', 'queue_in_doc'}


class NewGateForm(forms.ModelForm):
    class Meta:
        model = Doc_Gate
        fields = {'document', 'gate'}


class CarryOutItemsForm(forms.ModelForm):
    class Meta:
        model = Carry_Out_Items
        fields = {'document', 'item_name', 'quantity', 'measurement'}


class NewMockupTypeForm(forms.ModelForm):
    class Meta:
        model = Doc_Mockup_Type
        fields = {'document', 'mockup_type'}


class NewMockupProductTypeForm(forms.ModelForm):
    class Meta:
        model = Doc_Mockup_Product_Type
        fields = {'document', 'mockup_product_type'}


class NewCounterpartyForm(forms.ModelForm):
    class Meta:
        model = Doc_Counterparty
        fields = {'document', 'counterparty'}


class ApprovedDocForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = {'approved', 'approved_date'}


class NewDocContractForm(forms.ModelForm):
    class Meta:
        model = Doc_Contract
        fields = {'document', 'contract_id'}
