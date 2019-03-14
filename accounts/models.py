from django.db import models
from django.contrib.auth.models import User


class Department(models.Model):
    name = models.CharField(max_length=200)
    text = models.CharField(max_length=4000, blank=True,null=True)
    manager = models.ForeignKey(User, related_name='department_manager', blank=True, null=True, on_delete='CASCADE')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(User)
    pip = models.CharField(max_length=100,blank=True,null=True)
    avatar = models.ImageField(upload_to='images/users', verbose_name='Аватар',blank=True,null=True)
    department = models.ForeignKey(Department,blank=True,null=True, on_delete='CASCADE',related_name='+', default=1)
    is_ticked_admin = models.BooleanField(default=False)
    is_it_admin = models.BooleanField(default=False)
    is_graph = models.BooleanField(default=False)
    is_wood = models.BooleanField(default=False)
    is_coal = models.BooleanField(default=False)
    is_etyl= models.BooleanField(default=False)
    is_kfs = models.BooleanField(default=False)
    is_broker = models.BooleanField(default=False)
    is_sales = models.BooleanField(default=False)
    is_doc_add = models.BooleanField(default=False)
    is_doc_order_add = models.BooleanField(default=False)
    is_bets = models.BooleanField(default=False)
    work = models.CharField(max_length=200,blank=True,null=True)
    on_vacation = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    acting = models.ForeignKey('self', blank=True, null=True)
    is_hr = models.BooleanField(default=False)  # Для відображення вкладки "Відділ кадрів" в EDMS

    n_main = models.CharField(max_length=4,null=True, blank=True)
    n_second = models.CharField(max_length=4, null=True, blank=True)
    n_mobile = models.CharField(max_length=4, null=True, blank=True)
    n_out = models.CharField(max_length=11, null=True, blank=True)
    mobile1 = models.CharField(max_length=11, null=True, blank=True)
    mobile2 = models.CharField(max_length=11, null=True, blank=True)

    def __str__(self):
        return self.user.last_name

    class Meta:
        verbose_name = 'Профіль'
        verbose_name_plural = 'Профілі'
