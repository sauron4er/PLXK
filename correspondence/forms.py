from django import forms
from .models import Law, Request, Request_law, Request_file, Scope, Law_scope, Request_acquaint


class NewScopeForm(forms.ModelForm):
    class Meta:
        model = Scope
        fields = ['name']


class DelScopeForm(forms.ModelForm):
    class Meta:
        model = Scope
        fields = ['is_active']


class NewLawForm(forms.ModelForm):
    class Meta:
        model = Law
        fields = ['name', 'url']


class DelLawForm(forms.ModelForm):
    class Meta:
        model = Law
        fields = ['is_active']


class NewLawScopeForm(forms.ModelForm):
    class Meta:
        model = Law_scope
        fields = ['law', 'scope']


class NewRequestForm(forms.ModelForm):
    class Meta:
        model = Request
        fields = ['unique_number', 'type', 'scope', 'client', 'request_date', 'responsible',
                  'answer_responsible', 'answer', 'request_term', 'answer_date', 'author_comment']


class DeactivateRequestForm(forms.ModelForm):
    class Meta:
        model = Request
        fields = ['is_active']


class NewRequestLawForm(forms.ModelForm):
    class Meta:
        model = Request_law
        fields = ['request', 'law']


class DeactivateRequestLawForm(forms.ModelForm):
    class Meta:
        model = Request_law
        fields = ['is_active']


class NewAcquaintForm(forms.ModelForm):
    class Meta:
        model = Request_acquaint
        fields = ['request', 'acquaint']


class DeactivateAcquaintForm(forms.ModelForm):
    class Meta:
        model = Request_acquaint
        fields = ['is_active']


class DeactivateRequestFileForm(forms.ModelForm):
    class Meta:
        model = Request_file
        fields = ['is_active']


class DeactivateAnswerFileForm(forms.ModelForm):
    class Meta:
        model = Request_file
        fields = ['is_active']
