from django import forms
from .models import Topic, Ad


class NewTopicForm(forms.ModelForm):
    message = forms.CharField(
        widget=forms.Textarea(
            attrs={'rows': 5, 'placeholder': 'Введіть повідомлення(до 4000 символів)'}
        ),
        max_length=4000
        )

    class Meta:
        model = Topic
        fields = ['subject', 'message']


class NewAdForm(forms.ModelForm):
    message = forms.CharField(
        widget=forms.Textarea(
            attrs={'rows': 5, 'placeholder': 'Введіть текст оголошення'}
        ),
        max_length=4000
        )

    class Meta:
        model = Ad
        fields = ['ad']
