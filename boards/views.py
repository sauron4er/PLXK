from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from datetime import date, datetime, timedelta
from django.http import Http404, HttpResponse
import xml.etree.cElementTree as ET
from django.core.files import File
from django.utils import timezone
from django.db import connections
import threading
# import schedule
import random
# import time
import pytz
import json
import os
from plxk.api.pagination import sort_query_set, filter_query_set
from plxk.api.global_getters import get_userprofiles_list
# from boards.api.auto_vacations import auto_arrange_vacations
from boards.api.auto_orders import send_orders_reminders
from edms.models import Employee_Seat, Foyer
from accounts.models import UserProfile
from django.contrib.auth.models import User
from plxk.api.try_except import try_except
from .models import Board, Topic, Post, Ad
from .forms import NewTopicForm


auto_functions_started = False


@login_required(login_url='login')
def get_userprofiles(request, added_info=0):
    # added_info додано для випадку, якщо запрос робиться зі сторінки тіпа .../7/
    if request.method == 'GET':
        userprofiles_list = get_userprofiles_list()
        return HttpResponse(json.dumps(userprofiles_list))


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
        .filter(employee__delete_from_noms=False)
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
    # auto_arrange_vacations()
    send_orders_reminders()
    print("auto_functions executed: ", datetime.now().strftime("%d/%m/%Y %H:%M:%S"))


def start_auto_functions():
    test = True
    # global auto_functions_started
    # auto_functions_started = True
    #
    # schedule.every().day.at("07:00").do(auto_functions)
    # while True:
    #     schedule.run_pending()
    #     time.sleep(60)


def home(request):
    if request.method == 'GET':
        return render(request, 'home.html', {
            'auto_functions_started': auto_functions_started,
            'birthdays': get_bds(),
            'ads': get_ads(),
            'bg': random.randint(1, 10)})
    # if request.method == 'POST':
    #     t1 = threading.Thread(target=start_auto_functions(), args=(), kwargs={}, daemon=True)
    #     t1.start()
    #     return render(request, 'home.html', {
    #         'auto_functions_started': auto_functions_started,
    #         'birthdays': get_bds(),
    #         'ads': get_ads(),
    #         'bg': random.randint(1, 9)})


@login_required(login_url='login')
@try_except
def phones(request):
    phones_and_mails = UserProfile.objects\
        .prefetch_related('positions') \
        .filter(is_active=True) \
        .filter(user__is_active=True) \
        .exclude(delete_from_noms=True) \
        .filter(is_pc_user=True) \
        .order_by('pip')

    pam = [{
        'id': item.user.id,
        'pip': item.pip or '',
        'mail': item.user.email or '',
        'phone': item.n_main or '',
        'seats': [emp_seat.seat.seat if emp_seat.is_main else emp_seat.seat.seat + ' (в.о.)'
                  for emp_seat in item.positions.filter(is_active=True)],
    } for item in phones_and_mails]

    return render(request, 'boards/phones/phones.html', {'pam': pam})

@try_except
def change_pam(request):
    employee = json.loads(request.POST['employee'])

    employee_instance = get_object_or_404(User, pk=employee['id'])
    employee_instance.email = employee['mail']
    employee_instance.userprofile.n_main = employee['phone']
    employee_instance.userprofile.save()
    employee_instance.save()

    return HttpResponse(200)


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


@login_required(login_url='login')
@try_except
def foyer(request):
    return render(request, 'boards/foyer/foyer.html')


@login_required(login_url='login')
@try_except
def get_foyer_data(request, page):
    foyer = Foyer.objects.filter(is_active=True)

    foyer = filter_query_set(foyer, json.loads(request.POST['filtering']))
    foyer = sort_query_set(foyer, request.POST['sort_name'], request.POST['sort_direction'])

    paginator = Paginator(foyer, 23)
    try:
        foyer_page = paginator.page(int(page) + 1)
    except PageNotAnInteger:
        foyer_page = paginator.page(1)
    except EmptyPage:
        foyer_page = paginator.page(1)

    foyer = [{
        'id': item.pk,
        'employee__pip': item.employee.pip,
        'employee__tab_number': item.employee.tab_number,
        'edms_doc__doc_type_version__description': item.edms_doc.doc_type_version.description,
        'out_datetime': convert_to_localtime(item.out_datetime, 'time') if item.out_datetime else '',
        'in_datetime': convert_to_localtime(item.in_datetime, 'time') if item.in_datetime else '',
        'edms_doc__id': item.edms_doc_id,
    } for item in foyer_page.object_list]

    response = {'rows': foyer, 'pagesCount': paginator.num_pages}
    return HttpResponse(json.dumps(response))


@login_required(login_url='login')
@try_except
def create_foyer_report(request):
    today = datetime.today()
    if today.day > 15:
        first_day = today.replace(day=1, hour=0, minute=0, second=0)
        last_day = today.replace(day=16, hour=23, minute=59, second=59)
        filename = 'foyer_report_' + str(today.month) + '-' + str(today.year) + '_1.xml'
    else:
        last_day = (today.replace(day=1) - timedelta(days=1))  # останній день попереднього місяця
        last_day = last_day.replace(hour=23, minute=59, second=59)
        first_day = last_day.replace(day=16, hour=0, minute=0, second=0)  # 16 число попереднього місяця

        filename = 'foyer_report_' + str(last_day.month) + '-' + str(last_day.year) + '_2.xml'

    foyer_query_set = Foyer.objects\
        .filter(out_datetime__range=[first_day, last_day])\
        .filter(is_active=True)

    foyer = [{
        'id': item.id,
        'tab_number': item.employee.tab_number,
        'doc_type': item.edms_doc.doc_type_version.description,
        'in': convert_to_localtime(item.in_datetime, 'time') if item.in_datetime else '',
        'out': convert_to_localtime(item.out_datetime, 'time') if item.out_datetime else '',
        'absence_based': item.absence_based
    } for item in foyer_query_set]

    root = ET.Element('foyer')

    for item in foyer:
        doc = ET.SubElement(root, "item")
        ET.SubElement(doc, "id").text = str(item['id'])
        ET.SubElement(doc, "tab_number").text = item['tab_number']
        ET.SubElement(doc, "doc_type").text = item['doc_type']
        ET.SubElement(doc, "in").text = item['in']
        ET.SubElement(doc, "out").text = item['out']
        ET.SubElement(doc, "absence_based").text = str(item['absence_based'])

    tree = ET.ElementTree(root)
    tree.write('files/media/foyer/' + filename)

    return HttpResponse('media/foyer/' + filename)


#  --------------------------------------------------- Vacations
@login_required(login_url='login')
@try_except
def vacations(request):
    vacations_list = []
    return render(request, 'boards/vacations/index.html', {'vacations': vacations_list})


@login_required(login_url='login')
@try_except
def convert_files_names_to_utf(request):
    # Перейменування усіх файлів з linux кракозябри на кирилицю:

    folder = 'C:/PLXK/files/media'
    # Програма проходить по всьому дереву і перейменовує всі файли.
    # Якщо щось не може перейменувати, то пропускає.

    for root, dirs, files in os.walk(folder):
        root = root.replace('\\', '/')
        for file in os.listdir(root):
            if os.path.isfile(root + '/' + file) and file != 'react_статті.txt':
                try:
                    print('--------------------------')
                    print(root + '/' + file)
                    file_decoded = file.encode('cp1251').decode('utf8')
                    old_path = os.path.join(root, file)
                    new_path = os.path.join(root, file_decoded)
                    os.rename(old_path, new_path)
                    print('done')
                    print('--------------------------')
                except Exception:
                    pass

    return render(request, 'home.html', {
        'auto_functions_started': auto_functions_started,
        'birthdays': get_bds(),
        'ads': get_ads(),
        'bg': random.randint(1, 10)})
