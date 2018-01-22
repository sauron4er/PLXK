from django.contrib.auth.models import User
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpRequest
from .models import Document,Ct,Order_doc
from .forms import NewDocForm, NewDocOrderForm
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile

def user_can_edit(user):
    return user.is_authenticated() and user.has_perm("docs.change_document")

def index(request):
    docs = Document.objects.all()
    edit =user_can_edit(request.user)
    return render(request,'docs/index.html',{'docs':docs, 'edit':edit})

def index_f(request,fk):
    if fk == 0:
        docs = Document.objects.all()
    else:
        docs = Document.objects.all().filter(doc_group=fk)
    edit =user_can_edit(request.user)
    return render(request,'docs/index.html',{'docs':docs, 'edit':edit, 'fk': fk})

def new_doc(request):
    title = 'Новий документ'
    if request.user:
        user = request.user
    else:
        user = User.objects.first()
    #user =HttpRequest.user.
    if request.method == 'POST':
        form = NewDocForm(request.POST,request.FILES)
        if form.is_valid():
            doc = Document.objects.create(
                name=form.cleaned_data.get('name'),
                code=form.cleaned_data.get('code'),
                doc_type=form.cleaned_data.get('doc_type'),
                doc_group=form.cleaned_data.get('doc_group'),
                date_start=form.cleaned_data.get('date_start'),
                author=form.cleaned_data.get('author'),
                responsible=form.cleaned_data.get('responsible'),
                act=form.cleaned_data.get('act'),
                doc_file=request.FILES['doc_file'],
                created_by=user
            )
            return redirect('docs:index')
    else:
        form = NewDocForm()
    return render(request,'docs/new_doc.html',{'form':form,'title':title})

def edit_doc(request,pk):
    doc = get_object_or_404(Document,pk=pk)
    title = 'Редагування'

    if request.user:
        user = request.user
    else:
        user = User.objects.first()
    if request.method == 'POST':
        form = NewDocForm(request.POST,request.FILES,instance=doc)
        if form.is_valid():
            doc.updated_by = user
            doc.updated_at = timezone.now()
            form.save()
        return redirect('docs:index')
    else:
        form = NewDocForm(instance=doc)
    return render(request,'docs/new_doc.html',{'form':form,'title':title})

def index_order_f(request,fk):
    if fk == '0':
        docs = Order_doc.objects.all()
    else:
        docs = Order_doc.objects.all().filter(doc_type=fk)
    return render(request,'docs/order_index.html',{'docs':docs, 'fk': fk})

def new_order_doc(request):
    title = 'Новий нормативний документ'
    if request.user:
        user = request.user
    else:
        user = User.objects.first()
    #user =HttpRequest.user.
    if request.method == 'POST':
        form = NewDocOrderForm(request.POST,request.FILES)
        if form.is_valid():
            doc = Order_doc.objects.create(
                name=form.cleaned_data.get('name'),
                code=form.cleaned_data.get('code'),
                doc_type=form.cleaned_data.get('doc_type'),
                date_start=form.cleaned_data.get('date_start'),
                author=form.cleaned_data.get('author'),
                responsible=form.cleaned_data.get('responsible'),
                doc_file=request.FILES['doc_file'],
                created_by=user
            )
            return redirect('docs:index_order_f')
    else:
        form = NewDocOrderForm()
    return render(request,'docs/new_order_doc.html',{'form':form,'title':title})

