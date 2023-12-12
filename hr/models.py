from django.db import models
from django.utils import timezone
from edms.models import Seat
from accounts.models import Department


class Department_Regulation(models.Model):
    name = models.CharField(max_length=100)
    number = models.CharField(max_length=12)
    version = models.CharField(max_length=3)
    staff_units = models.CharField(max_length=3, null=True)
    department = models.ForeignKey(Department, related_name='regulations', on_delete=models.RESTRICT)
    date_start = models.DateField(default=timezone.now)
    date_revision = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)


class Instruction(models.Model):
    name = models.CharField(max_length=100)
    number = models.CharField(max_length=12)
    version = models.CharField(max_length=3)
    type = models.CharField(max_length=4)  # 'work' or 'seat' (робоча чи посадова)

    # If department_id saved - this is work instruction, that not linked to a seat but only to department.
    # If seat_id saved - this is seat instruction, that linked to the seat.
    department = models.ForeignKey(Department, related_name='instructions', on_delete=models.RESTRICT, null=True)
    seat = models.ForeignKey(Seat, related_name='instructions', on_delete=models.RESTRICT, null=True)

    staff_units = models.CharField(max_length=3, null=True)
    date_start = models.DateField(default=timezone.now)
    date_revision = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)


class Regulation_file(models.Model):
    file = models.FileField(upload_to='hr/regulations/%Y/%m')
    name = models.CharField(max_length=100)
    regulation = models.ForeignKey(Department_Regulation, related_name='files', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Instruction_file(models.Model):
    file = models.FileField(upload_to='hr/instructions/%Y/%m')
    name = models.CharField(max_length=100)
    instruction = models.ForeignKey(Instruction, related_name='files', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)
