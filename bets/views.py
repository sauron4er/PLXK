from django.shortcuts import render, get_object_or_404, redirect
from .models import Team,Match, Bet
from django.contrib.auth.models import User
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .forms import NewBetForm

def index(request):
    return render(request, 'bets/index.html')

def teams(request):
    teams = Team.objects.all()
    return render(request, 'bets/teams.html',{'teams': teams})

def matches(request):
    matches = Match.objects.all().order_by('-dt')
    bets = Bet.objects.all().filter(player=request.user).select_related('match')
    #m1 = matches.u
    paginator = Paginator(matches, 16)
    ct = matches.count()
    page = request.GET.get('page')
    try:
        matches = paginator.page(page)
    except PageNotAnInteger:
        matches = paginator.page(1)
    except EmptyPage:
        matches
    return render(request, 'bets/matches.html', {'matches': matches, 'ct':ct,'bets':bets})

def bets(request):
    bets = Bet.objects.all().order_by('-match__dt')
    paginator = Paginator(bets, 16)
    ct = bets.count()
    page = request.GET.get('page')
    try:
        bets = paginator.page(page)
    except PageNotAnInteger:
        bets = paginator.page(1)
    except EmptyPage:
        bets
    return render(request, 'bets/bets.html', {'bets': bets, 'ct':ct})

def new_bet(request,mid):
    title = 'Нова ставка'
    if request.user:
        user = request.user
    else:
        user = User.objects.first()
    match = get_object_or_404(Match, pk=mid)
    bet = get_object_or_404(Bet, match_id = mid, player = user)

    if request.method == 'POST':

        bet1 = int(request.POST['team1_bet'])
        bet2 = int(request.POST['team2_bet'])
        if bet:
            bet.team1_bet = bet1
            bet.team2_bet = bet2
            bet.save()
        else:
            bet = Bet.objects.create(player=user,
                                 match_id=mid,
                                 team1_bet=bet1,
                                 team2_bet=bet2,)
        return redirect('bets:bets')
    else:
        pass
    return render(request,'bets/new_bet.html',{'title':title,'match':match,'bet':bet})