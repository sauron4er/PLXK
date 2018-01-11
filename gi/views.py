from django.shortcuts import render, get_object_or_404
from .models import News

def news(request):
    newss = News.objects.all().order_by('-date_start')
    return render(request,'gi/news.html',{'newss':newss})

def news_detail(request,pk):
    new1 = get_object_or_404(News,pk=pk)
    return render(request,'gi/news_detail.html',{'new1':new1})