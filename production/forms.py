from django import forms

from production.models import *


class NewProductTypeForm(forms.ModelForm):
    class Meta:
        model = Product_type
        fields = ['name', 'meta_type', 'direction']


class DelProductForm(forms.ModelForm):
    class Meta:
        model = Product_type
        fields = ['is_active']


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


class NewScopeForm(forms.ModelForm):
    class Meta:
        model = Scope
        fields = ['name']


class DelScopeForm(forms.ModelForm):
    class Meta:
        model = Scope
        fields = ['is_active']


class NewPermissionCategoryForm(forms.ModelForm):
    class Meta:
        model = Permission_Category
        fields = ['name']


class DelPermissionCategoryForm(forms.ModelForm):
    class Meta:
        model = Permission_Category
        fields = ['is_active']
