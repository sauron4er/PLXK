from django.db import models
from django.contrib.auth.models import User


class News(models.Model):
    title = models.CharField(max_length=200)
    text = models.TextField(max_length=4000,blank=True,null=True )
    date_start = models.DateTimeField(null=True,blank=True)
    author = models.ForeignKey(User, null=True, related_name='+', on_delete=models.PROTECT,blank=True)
    doc_file = models.FileField(upload_to='news_file/%Y/%m',null=True,blank=True)
    img_file = models.ImageField(upload_to='news_img/%Y/%m',null=True,blank=True)
    img_text = models.CharField(max_length=200,null=True,blank=True)
    text_url = models.URLField(max_length=500,null=True,blank=True)

    def __str__(self):
        return self.title


class Country(models.Model):
    name = models.CharField(max_length=200)
    name_en = models.CharField(max_length=200, null=True, blank=True)
    code = models.CharField(max_length=3, null=True, blank=True)
    flag = models.ImageField(upload_to='country_flag', null=True, blank=True)

    def __str__(self):
        return self.name
