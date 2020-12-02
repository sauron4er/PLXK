from django.db import models
from django.contrib.auth.models import User


class State(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Group(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Priority(models.Model):
    name = models.CharField(max_length=50)
    ico = models.ImageField(upload_to='images/ico',blank=True)

    def __str__(self):
        return self.name


class Ticket(models.Model):
    group = models.ForeignKey(Group, on_delete=models.RESTRICT)
    text = models.TextField(max_length=4000)
    priority = models.ForeignKey(Priority,on_delete=models.RESTRICT)
    state = models.ForeignKey(State,on_delete=models.RESTRICT)
    user = models.ForeignKey(User,related_name='ticket_user',on_delete=models.RESTRICT)
    responsible = models.ForeignKey(User,related_name='ticketResponsible',blank=True,on_delete=models.RESTRICT)
    created_at = models.DateTimeField(auto_now_add=True)
    doc_file = models.FileField(upload_to='tickets/%Y/%m', blank=True)


class Ticket_content(models.Model):
    user = models.ForeignKey(User,related_name='ticket_content_user',on_delete=models.RESTRICT)
    ticket = models.ForeignKey(Ticket,related_name='ticket_ct_ticket',on_delete=models.RESTRICT)
    state = models.ForeignKey(State,related_name='ticket_ct_state',on_delete=models.RESTRICT)
    text = models.TextField(max_length=4000,blank=True)
    dt = models.DateTimeField(auto_now_add=True)
