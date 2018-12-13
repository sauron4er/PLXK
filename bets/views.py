from django.shortcuts import render, get_object_or_404, redirect
from .models import Team, Match, Bet
from django.contrib.auth.models import User
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.utils.timezone import datetime
from datetime import date
from .forms import NewBetForm
from django.db.models import Sum

def is_int(val):
    if type(val) == int:
        return True
    else:
        return False

def index(request):
    return render(request, 'bets/index.html')

def teams(request):
    teams = Team.objects.all()
    return render(request, 'bets/teams.html', {'teams': teams})

def matches(request):
    matches = Match.objects.all().order_by('dt').filter(dt__gte=date.today())
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
    bets = Bet.objects.all().filter(player=request.user).order_by('match__dt')
    bv = bets.values()
    paginator = Paginator(bets, 16)
    ct = bets.count()
    page = request.GET.get('page')
    try:
        bets = paginator.page(page)
    except PageNotAnInteger:
        bets = paginator.page(1)
    except EmptyPage:
        bets
    return render(request, 'bets/bets.html', {'bets': bets, 'ct':ct, 'bt':bv})

def new_bet(request,mid):
    title = 'Нова ставка'
    if request.user:
        user = request.user
    else:
        user = User.objects.first()
    match = get_object_or_404(Match, pk=mid)
    bet, cr = Bet.objects.get_or_create(match_id = mid, player= user)



    if request.method == 'POST':

        bet1 = int(request.POST['team1_bet'])
        bet2 = int(request.POST['team2_bet'])
        bet.team1_bet = bet1
        bet.team2_bet = bet2
        bet.save()
        return redirect('bets:results')
        # results(request)
    else:
        pass
    return render(request,'bets/new_bet.html',{'title':title,'match':match,'bet':bet})

def new_result(request,mid):
    title = 'Новий резульат'
    if request.user:
        user = request.user
    else:
        user = User.objects.first()
    match = get_object_or_404(Match, pk=mid)
    if request.method == 'POST':

        res1 = int(request.POST['team1_result'])
        res2 = int(request.POST['team2_result'])
        if match:
            match.team1_result = res1
            match.team2_result = res2
            match.save()
        return redirect('bets:results')
    else:
        pass
    return render(request,'bets/new_result.html',{'title':title,'match':match})

def results(request):
    bets = Bet.objects.all().order_by('match__dt').filter(match__season=4)
    # players = User.objects.filter(userprofile__is_bets=True)
    players = User.objects.raw('select *, '
                               '(select sum(b.points) '
                               'from bets_bet b '
                               'left join bets_match bm on b.match_id = bm.id '
                               'where b.player_id = u.id '
                               'and bm.season_id = 4 '
                               ') as points '
                               'from auth_user u '
                               'left join accounts_userprofile au on u.id = au.user_id '                                  
                               'where au.is_bets >0')
    # players1 ={}
    # for p in players:
    #     players1['id'] = p.id
    #     players1['name'] = p.userprofile.pip
    #     players1['point'] = 0

    matches1 = Match.objects.all().order_by('dt').filter(season=4)
    td = datetime.now()
    old_matches_count = Match.objects.all().order_by('dt').filter(season=4).filter(dt__lte=td).count()
    rt = {}
    for m in matches1:
        rt[m.id] = {}
        for p in players:
            rt[m.id][p.id] = {}
            rt[m.id][p.id]['name'] = p.userprofile.pip
            rt[m.id][p.id]['id'] = p.id
            rt[m.id][p.id]['p'] = 0
            rt[m.id][p.id]['rt1'] = -1
            rt[m.id][p.id]['rt2'] = -1
            rt[m.id][p.id]['rt'] = " - : - "
    for b in bets:
        rt[b.match.id][b.player.id]['id'] = b.player.id
        rt[b.match.id][b.player.id]['p'] = b.points
        rt[b.match.id][b.player.id]['rt1'] = b.team1_bet
        rt[b.match.id][b.player.id]['rt2'] = b.team2_bet
        rt[b.match.id][b.player.id]['rt'] = " - : - "
        if  is_int(b.team1_bet) and is_int(b.team2_bet):
            rt[b.match.id][b.player.id]['rt'] = "%s - %s" % (b.team1_bet , b.team2_bet)


    paginator = Paginator(matches1, 16)
    ct = matches1.count()
    page = request.GET.get('page')

    try:
        # page = (old_matches_count // 16) + 1
        matches1 = paginator.page(page)
    except PageNotAnInteger:
        matches1 = paginator.page((old_matches_count // 16))
    except EmptyPage:
        matches1
    return render(request, 'bets/results.html', {'bets': bets, 'ct': ct,'rt' : rt, 'players': players, 'matches' :matches1})
