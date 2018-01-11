from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.template import loader

from .models import Question,Choice

def index(request):
    latest_question_list = Question.objects.order_by('-pub_date')[:5]
    contex = {'latest_question_list':latest_question_list}
    return render(request, 'polls/index.html', contex)

def detail(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    return render(request, 'polls/detail.html',{'question': question})

def results(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    return render(request, 'polls/results.html',{'question': question})

def vote(request, question_id):
    p = get_object_or_404(Question,pk=question_id)
    try:
        selected_shoice = p.choice_set.get(pk = request.POST['choice'])
    except (KeyError, Choice.DoesNotExist):
        return render(request,'polls/detail.html',{'question':p, 'error_message':"Не вибрано жодного варіанту. Будь ласка, зробіть свій вибір"})
    else:
        selected_shoice.votes +=1
        selected_shoice.save()
        return HttpResponseRedirect(reverse('polls:results',args=(p.id,)))