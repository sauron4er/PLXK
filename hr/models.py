from django.db import models
from django.utils import timezone
from edms.models import Seat
from accounts.models import Department


class Department_Regulation(models.Model):
    name = models.CharField(max_length=100)
    number = models.CharField(max_length=3)
    version = models.CharField(max_length=3)
    staff_units = models.CharField(max_length=3)
    department = models.ForeignKey(Department, related_name='regulations', on_delete=models.RESTRICT)
    date_start = models.DateField(default=timezone.now)
    date_revision = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)


class Seat_Instruction(models.Model):
    name = models.CharField(max_length=100)
    number = models.CharField(max_length=3)
    version = models.CharField(max_length=3)
    staff_units = models.CharField(max_length=3)
    seat = models.ForeignKey(Seat, related_name='instructions', on_delete=models.RESTRICT)
    date_start = models.DateField(default=timezone.now)
    date_revision = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)


class Regulation_file(models.Model):
    file = models.FileField(upload_to='hr/regulations/%Y/%m')
    name = models.CharField(max_length=100)
    regulation = models.ForeignKey(Department_Regulation, related_name='files', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Instruction_file(models.Model):
    file = models.FileField(upload_to='hr/regulations/%Y/%m')
    name = models.CharField(max_length=100)
    instruction = models.ForeignKey(Seat_Instruction, related_name='files', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)
