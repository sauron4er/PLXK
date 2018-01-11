from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class SignUpForm(UserCreationForm):
    email = forms.CharField(max_length=254, required=True, widget=forms.EmailInput())
    cap = forms.CharField(max_length=32, required=False)
    class Meta:
        model = User
        fields = ('username','email','cap', 'password1', 'password2')