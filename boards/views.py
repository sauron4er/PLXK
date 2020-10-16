from django.contrib.auth.models import User
from django.shortcuts import render, get_object_or_404, redirect
from django.http import Http404, HttpResponse
from .models import Board, Phones, Topic, Post, Ad
from .forms import NewTopicForm, NewAdForm
from django.db import connections
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from datetime import date
from django.utils import timezone
import pytz
import json
import random
import time
import schedule
import threading
from edms.models import Employee_Seat
from boards.api.auto_orders import arrange_orders
from boards.api.auto_vacations import arrange_vacations


auto_functions_started = False


def convert_to_localtime(utctime, frmt):
    if frmt == 'day':
        fmt = '%d.%m.%Y'
    else:
        fmt = '%d.%m.%Y %H:%M'

    utc = utctime.replace(tzinfo=pytz.UTC)
    localtz = utc.astimezone(timezone.get_current_timezone())
    return localtz.strftime(fmt)


def get_ads():
    return [{
        'id': ad.id,
        'ad': ad.ad,
        'author_id': ad.author.id,
        'author': ad.author.pip
    } for ad in Ad.objects.filter(is_active=True)]


def get_bds():
    today = date.today()

    # Отримуємо список працівників, в яких сьогодні д/н.
    # Якщо у працівника більше одніє посади він потрапить у цей список декілька раз
    birthdays_duplicates = [{
        'id': bd.employee.id,
        'name': bd.employee.pip,
        'seat': bd.seat.seat,
        'birthday': bd.employee.birthday.year,
        'photo': '' if not bd.employee.avatar else bd.employee.avatar.name
    } for bd in Employee_Seat.objects
        # .filter(employee__birthday__month=7, employee__birthday__day=16)
        .filter(employee__birthday__month=today.month, employee__birthday__day=today.day)
        .filter(is_main=True)
        .filter(is_active=True)
        .filter(employee__is_active=True)]

    # Позбавляємось дублікатів:
    return list({item["id"]: item for item in birthdays_duplicates}.values())


def dictfetchall(cursor):
    "Returns all rows from a cursor as a dict"
    desc = cursor.description
    return [
        dict(zip([col[0] for col in desc], row))
        for row in cursor.fetchall()
    ]


def forum(request):
    #boards = Board.objects.all()
    cursor = connections['default'].cursor()
    cursor.execute('select * from boads_all')
    boards = cursor.fetchall
    return render(request, 'boards/forum.html', {'boards':boards})


def about(request):
    return render(request, 'about.html')


def auto_functions():
    arrange_vacations()
    arrange_orders()


def start_auto_functions():
    global auto_functions_started
    auto_functions_started = True
    schedule.every().day.at("08:22").do(auto_functions)
    while True:
        schedule.run_pending()
        time.sleep(60)


def home(request):
    if request.method == 'GET':
        return render(request, 'home.html', {'auto_functions_started': auto_functions_started})
    if request.method == 'POST':
        t1 = threading.Thread(target=start_auto_functions(), args=(), kwargs={}, daemon=True)
        t1.start()
        return render(request, 'home.html', {'auto_functions_started': auto_functions_started})


def phones(request, pk):
    phones = User.objects.filter(userprofile__n_main__gte = 0)
    if pk == '0':
        phones = phones.order_by('userprofile__pip')
    elif pk == '1':
        phones = phones.order_by('userprofile__n_main')
    elif pk == '2':
        phones = phones.order_by('userprofile__n_second')
    elif pk == '3':
        phones = phones.order_by('userprofile__n_mobile')
    elif pk == '4':
        phones = phones.order_by('userprofile__n_out')
    elif pk == '5':
        phones = phones.order_by('userprofile__mobile1')
    else:
        phones = phones.order_by('userprofile__n_main')
    return render(request, 'boards/phones.html', {'phones': phones})


def get_context_data():  # Exec 1st
    context = {}
    return context


def plhk_ads(request):
    return render(request, 'boards/plhk_ads/plhk_ads.html', {'birthdays': get_bds(), 'ads': get_ads(), 'bg': random.randint(1, 10)})


def reload(request):
    if request.method == 'GET':
        response = {'ads': get_ads(), 'birthdays': get_bds()}
        return HttpResponse(json.dumps(response))


def edit_ads(request):
    return render(request, 'boards/plhk_ads/edit_ads.html', {'ads': get_ads()})


def new_ad(request):
    ad = request.POST['ad']

    ad = Ad.objects.create(
        ad=ad,
        author=request.user.userprofile
    )
    return redirect('/boards/edit_ads/', request)


def del_ad(request, pk):
    ad = get_object_or_404(Ad, pk=pk)
    Ad.objects.filter(id=ad.id).update(is_active=False)
    return redirect('/boards/edit_ads/', request)


def menu(request):
    with open('//fileserver/Транзит/menu.pdf', 'rb') as pdf:
        response = HttpResponse(pdf.read(), content_type='application/pdf')
        response['Content-Disposition'] = 'filename=//fileserver/Транзит/menu.pdf'
        return response


def board_topics(request, pk):
    try:
        myboard = Board.objects.get(pk=pk)
    except Board.DoesNotExist:
        raise Http404
    return render(request, 'boards/topics.html', {'board': myboard})


def new_topics1(request, pk):
    myboard = get_object_or_404(Board, pk=pk)

    if request.method == 'POST':
        subject = request.POST['subject']
        message = request.POST['message']

        user = User.objects.first()
        topic = Topic.objects.create(
            subject = subject,
            board = myboard,
            starter = user
        )
        post = Post.objects.create(
            message = message,
            topic = topic,
            created_by=user
        )
        return redirect('board_topics', pk=myboard.pk)
    return render(request, 'boards/new_topic.html', {'board': myboard})


def new_topics(request, pk):
    board = get_object_or_404(Board, pk=pk )
    user = User.objects.first()
    if request.method == 'POST':
        form = NewTopicForm(request.POST)
        if form.is_valid():
            topic = form.save(commit=False)
            topic.board = board
            topic.starter = user
            topic.save()
            post = Post.objects.create(
                message=form.cleaned_data.get('message'),
                topic=topic,
                created_by=user
            )
            return redirect('board_topics', pk=board.pk)
    else:
        form = NewTopicForm()
    return render(request, 'boards/new_topic.html', {'board': board, 'form': form})
