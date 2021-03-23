from django.db import models


class Product_meta_type(models.Model):
    name = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)


class Product_type(models.Model):
    name = models.CharField(max_length=50)
    direction = models.CharField(max_length=4, default='sale')  # Постачання чи продаж, buy чи sale
    meta_type = models.ForeignKey(Product_meta_type, related_name='product_types', on_delete=models.RESTRICT, null=True)
    is_active = models.BooleanField(default=True)


class Mockup_type(models.Model):
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)


class Mockup_product_type(models.Model):
    mockup_type = models.ForeignKey(Mockup_type, related_name='product_types', on_delete=models.RESTRICT)
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)


class Certification_type(models.Model):
    name = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)


class Scope(models.Model):
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
