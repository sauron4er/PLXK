from django.db import models
from accounts.models import Department, UserProfile


class Stationery_type(models.Model):
    name = models.CharField(max_length=50)
    measurement = models.CharField(max_length=10, default='шт.')
    is_active = models.BooleanField(default=True)


class Stationery_order(models.Model):
    stationery_type = models.ForeignKey(Stationery_type, related_name='orders', on_delete=models.RESTRICT)
    department = models.ForeignKey(Department, related_name='stationery_orders', on_delete=models.RESTRICT)
    author = models.ForeignKey(UserProfile, related_name='stationery_orders', on_delete=models.RESTRICT)
    quantity = models.PositiveSmallIntegerField(default=1)
    month = models.DateField()
    is_active = models.BooleanField(default=True)
