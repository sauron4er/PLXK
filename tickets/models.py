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
    group = models.ForeignKey(Group, on_delete='CASCADE')
    text = models.TextField(max_length=4000)
    priority = models.ForeignKey(Priority,on_delete='CASCADE')
    state = models.ForeignKey(State,on_delete='CASCADE')
    user = models.ForeignKey(User,related_name='ticket_user',on_delete='CASCADE')
    responsible = models.ForeignKey(User,related_name='ticketResponsible',blank=True,on_delete='CASCADE')
    created_at = models.DateTimeField(auto_now_add=True)
    doc_file = models.FileField(upload_to='tickets/%Y/%m', blank=True)
    #adresat

class Ticket_content(models.Model):
    user = models.ForeignKey(User,related_name='ticket_content_user',on_delete='CASCADE')
    ticket = models.ForeignKey(Ticket,related_name='ticket_ct_ticket',on_delete='CASCADE')
    state = models.ForeignKey(State,related_name='ticket_ct_state',on_delete='CASCADE')
    text = models.TextField(max_length=4000,blank=True)
    dt = models.DateTimeField(auto_now_add=True)