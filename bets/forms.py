from django import forms
from .models import Bet

class NewBetForm(forms.ModelForm):

    class Meta:
        model = Bet
        fields = ['team1_bet','team2_bet']
        labels = {'team1_bet':'Господарі',
                  'team2_bet':'Гості',
}

