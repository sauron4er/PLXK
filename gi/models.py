from django.db import models
from django.contrib.auth.models import User

class News(models.Model):
    title = models.CharField(max_length=200)
    text = models.TextField(max_length=4000,blank=True,null=True )
    date_start = models.DateTimeField(null=True,blank=True)
    author = models.ForeignKey(User, null=True, related_name='+', on_delete=models.CASCADE,blank=True)
    doc_file = models.FileField(upload_to='news_file/%Y/%m',null=True,blank=True)
    img_file = models.ImageField(upload_to='news_img/%Y/%m',null=True,blank=True)
    img_text = models.CharField(max_length=200,null=True,blank=True)
    text_url = models.URLField(max_length=500,null=True,blank=True)
    def __str__(self):
        return self.title