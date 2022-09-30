from django.db import models


class Product_meta_type(models.Model):
    name = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)


class Product_type(models.Model):
    name = models.CharField(max_length=50)
    direction = models.CharField(max_length=4, default='sale')  # Постачання чи продаж, buy чи sale
    meta_type = models.ForeignKey(Product_meta_type, related_name='product_types', on_delete=models.RESTRICT, null=True)
    is_active = models.BooleanField(default=True)


class Sub_product_type(models.Model):
    name = models.CharField(max_length=50)
    type = models.ForeignKey(Product_type, related_name='sub_product_types', on_delete=models.RESTRICT, null=True)
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


# ---------------------------------------------------------------------------------------------------------------------
# Номенклатура продукції для норм витрат
class Cost_Rates_Product(models.Model):
    name = models.CharField(max_length=30)
    department = models.CharField(max_length=11)
    is_active = models.BooleanField(default=True)


# Номенклатура норм витрат
class Cost_Rates_Nom(models.Model):
    product = models.ForeignKey(Cost_Rates_Product, related_name='fields', on_delete=models.RESTRICT)
    name = models.CharField(max_length=100)
    unit = models.CharField(max_length=10)
    is_required = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

# ---------------------------------------------------------------------------------------------------------------------


# Номенклатура предмету договору (від нього залежать списки візуючих та отримуючих у роботу
class Contract_Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

# ---------------------------------------------------------------------------------------------------------------------
