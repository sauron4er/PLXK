from django.db import models
from django.contrib.auth.models import User


class Product_type(models.Model):
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)


class Client(models.Model):
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)


class Law(models.Model):
    name = models.CharField(max_length=200)
    url = models.CharField(max_length=200)
    is_actual = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)


class Law_file(models.Model):
    file = models.FileField(upload_to='correspondence/laws/%Y/%m')
    name = models.CharField(max_length=100)
    law = models.ForeignKey(Law, related_name='files')
    is_active = models.BooleanField(default=True)


class Request(models.Model):
    product_type = models.ForeignKey(Product_type, related_name='requests')
    clients_name = models.ForeignKey(Client, related_name='requests')
    request_file = models.FileField(upload_to='correspondence/requests/%Y/%m')
    request_date = models.DateTimeField()
    request_term = models.DateTimeField()
    law = models.ForeignKey(Law, related_name='requests')
    responsible = models.ForeignKey(User, related_name='responsible')
    answer_responsible = models.ForeignKey(User, related_name='answer_responsible')
    answer = models.CharField(max_length=5000)
    answer_date = models.DateTimeField(null=True, blank=True)
    added_by = models.ForeignKey(User, related_name='requests_added')
    is_active = models.BooleanField(default=True)


class Answer_file(models.Model):
    file = models.FileField(upload_to='correspondence/request_answers/%Y/%m')
    name = models.CharField(max_length=100)
    request = models.ForeignKey(Request, related_name='answer_files')
    is_active = models.BooleanField(default=True)
