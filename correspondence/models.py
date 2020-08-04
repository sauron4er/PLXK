from django.db import models
from django.contrib.auth.models import User
from production.models import Product_type


class Scope(models.Model):
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)


class Client(models.Model):
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    product_type = models.ForeignKey(Product_type, related_name='clients')
    is_active = models.BooleanField(default=True)


class Law(models.Model):
    name = models.CharField(max_length=500)
    url = models.CharField(max_length=500)
    is_actual = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)


class Law_file(models.Model):
    file = models.FileField(upload_to='correspondence/laws/%Y/%m')
    name = models.CharField(max_length=100)
    law = models.ForeignKey(Law, related_name='files')
    is_active = models.BooleanField(default=True)


class Law_scope(models.Model):
    law = models.ForeignKey(Law, related_name='scopes')
    scope = models.ForeignKey(Scope, related_name='laws')
    is_active = models.BooleanField(default=True)


class Request(models.Model):
    type = models.SmallIntegerField()  # 1 - запит, 2 - рекламація
    scope = models.ForeignKey(Scope, related_name='requests')
    client = models.ForeignKey(Client, related_name='requests')
    request_date = models.DateField()
    request_term = models.DateField(null=True, blank=True, default=None)
    responsible = models.ForeignKey(User, related_name='responsible')
    answer_responsible = models.ForeignKey(User, related_name='answer_responsible')
    answer = models.CharField(max_length=5000, blank=True, null=True, default=None)
    answer_date = models.DateField(null=True, blank=True, default=None)
    author_comment = models.CharField(max_length=1000, null=True, blank=True)
    added_by = models.ForeignKey(User, related_name='requests_added')
    last_updated_by = models.ForeignKey(User, related_name='requests_updated', blank=True, null=True)
    is_active = models.BooleanField(default=True)


class Request_acquaint(models.Model):
    request = models.ForeignKey(Request, related_name='acquaints')
    acquaint = models.ForeignKey(User, related_name='requests_acquaint')
    is_active = models.BooleanField(default=True)


class Request_law(models.Model):
    request = models.ForeignKey(Request, related_name='request_laws')
    law = models.ForeignKey(Law, related_name='requests', blank=True, null=True)
    is_active = models.BooleanField(default=True)


class Request_file(models.Model):
    file = models.FileField(upload_to='correspondence/request/%Y/%m')
    name = models.CharField(max_length=100)
    request = models.ForeignKey(Request, related_name='request_files')
    is_active = models.BooleanField(default=True)


class Answer_file(models.Model):
    file = models.FileField(upload_to='correspondence/answers/%Y/%m')
    name = models.CharField(max_length=100)
    request = models.ForeignKey(Request, related_name='answer_files')
    is_active = models.BooleanField(default=True)
