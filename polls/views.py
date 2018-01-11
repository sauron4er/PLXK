from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views import generic
from django.utils import timezone
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db import connections

from .models import Choice, Question, User_Choice
from django.contrib.auth.models import User

def index(request):
    if request.user:
        user = request.user
    else:
        user = User.objects.first()
    uid = 0
    if user.id: uid = user.id
    cursor = connections['default'].cursor()
    text_sql = """ SELECT q.id, q.question_text, q.question_type, (select count(uc.id) from polls_user_choice uc where  uc.question_id = q.id and uc.employee_id = %i) as c from polls_question q """ % uid

    cursor.execute(text_sql)
    latest_question_list = cursor.fetchall()
    paginator = Paginator(latest_question_list,25)
    page = request.GET.get('page')
    try:
        latest_question_list = paginator.page(page)
    except PageNotAnInteger:
        latest_question_list = paginator.page(1)
    except EmptyPage:
        latest_question_list
    return render(request, 'polls/index.html', {'latest_question_list':latest_question_list})

class DetailView(generic.DetailView):
    #if True:        HttpResponseRedirect(reverse('polls:results', args=(p.id,))
    model = Question
    template_name = 'polls/detail.html'

    def get_queryset(self):
        return Question.objects.filter(pub_date__lte=timezone.now())

class ResultsView(generic.DetailView):
    model = Question
    template_name = 'polls/results.html'

def vote(request, question_id):
    if request.user:
        user = request.user
    else:
        user = User.objects.first()
    p = get_object_or_404(Question,pk=question_id)

    try:
        selected_shoice = p.choice_set.get(pk = request.POST['choice'])
    except (KeyError, Choice.DoesNotExist):
        return render(request,'polls/detail.html',{'question':p, 'error_message':"Не вибрано жодного варіанту. Будь ласка, зробіть свій вибір"})
    else:
        voted = User_Choice.objects.filter(employee = user)
        if voted.count() > 0:
            return HttpResponseRedirect(reverse('polls:index'))
        else:
            uc = User_Choice.objects.create(
                employee = user,
                choice = selected_shoice,
                question = p
            )
            uc.save()
            selected_shoice.votes +=1
            selected_shoice.save()
    return HttpResponseRedirect(reverse('polls:results',args=(p.id,)))