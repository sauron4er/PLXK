from django import forms

from production.models import *


class NewMockupTypeForm(forms.ModelForm):
    class Meta:
        model = Mockup_type
        fields = ['name']


class DelMockupTypeForm(forms.ModelForm):
    class Meta:
        model = Mockup_type
        fields = ['is_active']


class NewMockupProductTypeForm(forms.ModelForm):
    class Meta:
        model = Mockup_product_type
        fields = ['name', 'mockup_type']


class DelMockupProductTypeForm(forms.ModelForm):
    class Meta:
        model = Mockup_product_type
        fields = ['is_active']
