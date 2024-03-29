from django.db import models
from django.contrib.auth.models import User
from production.models import Product_type, Scope
from boards.models import Counterparty


class Client(models.Model):
    # DEPRECATED, ���� �볺��� ����� � ������������. �������� � �����.
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    product_type = models.ForeignKey(Product_type, related_name='clients', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Law(models.Model):
    name = models.CharField(max_length=500)
    url = models.CharField(max_length=500)
    is_actual = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)


class Law_file(models.Model):
    file = models.FileField(upload_to='correspondence/laws/%Y/%m')
    name = models.CharField(max_length=100)
    law = models.ForeignKey(Law, related_name='files', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Law_scope(models.Model):
    law = models.ForeignKey(Law, related_name='scopes', on_delete=models.RESTRICT)
    scope = models.ForeignKey(Scope, related_name='laws', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Request(models.Model):
    type = models.SmallIntegerField()  # 1 - �����, 2 - ����������
    unique_number = models.CharField(max_length=20, null=True, blank=True)
    scope = models.ForeignKey(Scope, related_name='requests', on_delete=models.RESTRICT)
    client = models.ForeignKey(Counterparty, related_name='requests', on_delete=models.RESTRICT)
    # client = models.ForeignKey(Client, related_name='requests', on_delete=models.RESTRICT)
    request_date = models.DateField()
    request_term = models.DateField(null=True, blank=True, default=None)
    responsible = models.ForeignKey(User, related_name='responsible', on_delete=models.RESTRICT)
    answer_responsible = models.ForeignKey(User, related_name='answer_responsible', on_delete=models.RESTRICT)
    answer = models.CharField(max_length=5000, blank=True, null=True, default=None)
    answer_date = models.DateField(null=True, blank=True, default=None)
    author_comment = models.CharField(max_length=5000, null=True, blank=True)
    added_by = models.ForeignKey(User, related_name='requests_added', on_delete=models.RESTRICT)
    last_updated_by = models.ForeignKey(User, related_name='requests_updated', blank=True, null=True, on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Request_acquaint(models.Model):
    request = models.ForeignKey(Request, related_name='acquaints', on_delete=models.RESTRICT)
    acquaint = models.ForeignKey(User, related_name='requests_acquaint', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Request_law(models.Model):
    request = models.ForeignKey(Request, related_name='request_laws', on_delete=models.RESTRICT)
    law = models.ForeignKey(Law, related_name='requests', blank=True, null=True, on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Request_file(models.Model):
    file = models.FileField(upload_to='correspondence/request/%Y/%m')
    name = models.CharField(max_length=100)
    request = models.ForeignKey(Request, related_name='request_files', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Answer_file(models.Model):
    file = models.FileField(upload_to='correspondence/answers/%Y/%m')
    name = models.CharField(max_length=100)
    request = models.ForeignKey(Request, related_name='answer_files', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


# ----------------------------------- Correspondence Templates
class Corr_Template(models.Model):
    name = models.CharField(max_length=100, unique=True)
    comment = models.CharField(max_length=1000, null=True)
    is_active = models.BooleanField(default=True)


class Corr_Template_File(models.Model):
    file = models.FileField(upload_to='correspondence/corr_templates/%Y/%m')
    name = models.CharField(max_length=100)
    corr_template = models.ForeignKey(Corr_Template, related_name='files', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)
