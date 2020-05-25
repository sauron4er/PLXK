from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views import generic
from django.utils import timezone
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db import connections
from django.contrib.auth.decorators import login_required
from tickets.forms import NewTicketForm,NewTicketContentForm
from .models import Ticket,State,Group,Ticket_content
from django.contrib.auth.models import User


@login_required(login_url='login')
def index(request):
    tickets = Ticket.objects.all()
    return render(request, 'tickets/index.html', {'tickets':tickets})


@login_required(login_url='login')
def index_f(request,fk):
    tickets = Ticket.objects.all()
    if fk == '1':tickets = tickets.filter(state_id = 1)
    if fk == '24':tickets = tickets.filter(state_id__in = [2,4])
    if fk == '3': tickets = tickets.filter(state_id=3)
    if fk == '5': tickets = tickets.filter(state_id = 5)
    ct = tickets.count()
    paginator = Paginator(tickets, 25)
    page = request.GET.get('page')
    try:
        tickets = paginator.page(page)
    except PageNotAnInteger:
        tickets = paginator.page(1)
    except EmptyPage:
        tickets
    return render(request, 'tickets/index.html',{'fk' : fk, 'tickets':tickets , 'ct':ct})


@login_required(login_url='login')
def new(request):
    if request.user:
        user = request.user
    else:
        user = User.objects.first()
    if request.method == 'POST':
        form = NewTicketForm(request.POST,request.FILES)
        if form.is_valid():
            ticket = Ticket.objects.create(

                text=form.cleaned_data.get('text'),
                group=form.cleaned_data.get('group'),
                priority=form.cleaned_data.get('priority'),
                user=user,
                state_id =1
            )
            if request.FILES.get('doc_file', None):
                ticket.doc_file=request.FILES['doc_file']
            ticket.save()
            return redirect('tickets:index_f', fk =0)
    else:
        form = NewTicketForm()
    return render(request, 'tickets/new_ticket.html', {'form':form})


@login_required(login_url='login')
def detail(request,pk):
    ticket = Ticket.objects.get(pk = pk);
    ticket_content = Ticket_content.objects.all().filter(ticket = ticket).order_by('-dt')
    if request.user:
        user = request.user
    else:
        user = User.objects.first()
    is_author = user == ticket.user
    is_ticked_admin = user.userprofile.is_ticked_admin
    st = None
    if is_author:
        st = State.objects.all().filter(id__in = [ticket.state_id,4,5])
    if is_ticked_admin:
        st = State.objects.all()

    if request.method == 'POST':
        #form = NewTicketContentForm(request.POST)
        if True:#form.is_valid():
            ticket_content = Ticket_content.objects.create(user= user, ticket=ticket, text=request.POST['text'], state_id=request.POST['state'],)
            #if not request.POST['text']: ticket_content.text =
            ticket_content.save()
            ticket.state_id = request.POST['state']
            ticket.save()
            return redirect('tickets:detail', pk =pk)
    #else:
        #form = NewTicketContentForm()
        #form.state = ticket.state    'form':form,
    return render(request, 'tickets/detail.html',{'ticket_content':ticket_content,'ticket':ticket, 'st':st, 'is_author':is_author,'is_ticked_admin':is_ticked_admin })