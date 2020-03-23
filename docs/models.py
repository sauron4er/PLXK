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
    doc_type = models.ForeignKey(Doc_type, related_name='Documents', on_delete='CASCADE')
    doc_group = models.ForeignKey(Doc_group, related_name='Documents', on_delete='CASCADE')
    code = models.CharField(max_length=100, null=True, blank=True)
    doc_file = models.FileField(upload_to='docs/%Y/%m')
    act = models.CharField(max_length=50, null=True, blank=True)
    actuality = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, related_name='+', on_delete=models.CASCADE)
    updated_by = models.ForeignKey(User, null=True, blank=True, related_name='+', on_delete=models.CASCADE)
    date_start = models.DateField(null=True)
    date_fin = models.DateField(null=True)
    author = models.CharField(max_length=100, null=True, blank=True)
    responsible = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)

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
    doc_type = models.ForeignKey(Order_doc_type, related_name='Documents', on_delete='CASCADE')
    code = models.CharField(max_length=100, null=True, blank=True)
    cancels_code = models.CharField(max_length=100, null=True, blank=True)
    # doc_file = models.FileField(upload_to='order_docs/%Y/%m')
    # cancels_file = models.FileField(upload_to='order_docs/%Y/%m', null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, related_name='+', on_delete=models.CASCADE)
    updated_by = models.ForeignKey(User, null=True, blank=True, related_name='+', on_delete=models.CASCADE)
    date_start = models.DateField(null=True)
    date_canceled = models.DateField(null=True, blank=True)
    canceled_by = models.ForeignKey('self', related_name='cancels_order', null=True, blank=True)
    cancels = models.ForeignKey('self', related_name='cancelled_by_order', null=True, blank=True)
    author = models.ForeignKey(User, related_name='Created_documents')
    responsible = models.ForeignKey(User, related_name='Responsible_for_documents')
    supervisory = models.ForeignKey(User, related_name='Supervisory_for_documents', null=True, blank=True)
    is_act = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class File(models.Model):
    file = models.FileField(upload_to='order_docs/%Y/%m')
    name = models.CharField(max_length=100, null=True, blank=True)
    order = models.ForeignKey(Order_doc, related_name='files', null=True)
    is_added_or_cancelled = models.BooleanField(default=True)  # True - додані наказом документи, False - скасовані наказом документи
    is_active = models.BooleanField(default=True)
