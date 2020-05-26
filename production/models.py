from django.db import models


class Mockup_type(models.Model):
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)


class Mockup_product_type(models.Model):
    mockup_type = models.ForeignKey(Mockup_type, related_name='product_types')
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
