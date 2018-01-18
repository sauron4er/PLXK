from django.db import models
from django.contrib.auth.models import User

class Doc_group(models.Model):
    name = models.CharField(max_length=50)
    def __str__(self):
        return self.name

class Doc_type(models.Model):
    name = models.CharField(max_length=50)
    def __str__(self):
        return self.name

class Document(models.Model):
    name = models.CharField(max_length=500)
    doc_type = models.ForeignKey(Doc_type, related_name='Documents',on_delete='CASCADE')
    doc_group = models.ForeignKey(Doc_group, related_name='Documents',on_delete='CASCADE')
    code = models.CharField(max_length=100,null=True,blank=True)
    doc_file = models.FileField(upload_to='docs/%Y/%m')
    act = models.CharField(max_length=50, null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True,blank=True)
    created_by = models.ForeignKey(User, related_name='+', on_delete=models.CASCADE)
    updated_by = models.ForeignKey(User, null=True,blank=True, related_name='+', on_delete=models.CASCADE)
    date_start = models.DateField(null=True)
    date_fin = models.DateField(null=True)
    author = models.CharField(max_length=100,null=True,blank=True)
    responsible = models.CharField(max_length=100,null=True, blank=True)

    def __str__(self):
        return self.name
class Ct(models.Model):
    dt = models.DateTimeField(null=True,blank=True,auto_now_add=True)
    u = models.ForeignKey(User, related_name='+', blank=True, on_delete=models.CASCADE)

class Order_doc_type(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name

class Order_doc(models.Model):
    name = models.CharField(max_length=500)
    doc_type = models.ForeignKey(Order_doc_type, related_name='Documents',on_delete='CASCADE')
    code = models.CharField(max_length=100,null=True,blank=True)
    doc_file = models.FileField(upload_to='order_docs/%Y/%m')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True,blank=True)
    created_by = models.ForeignKey(User, related_name='+', on_delete=models.CASCADE)
    updated_by = models.ForeignKey(User, null=True,blank=True, related_name='+', on_delete=models.CASCADE)
    date_start = models.DateField(null=True)
    author = models.CharField(max_length=100,null=True,blank=True)
    responsible = models.CharField(max_length=100,null=True, blank=True)

    def __str__(self):
        return self.name