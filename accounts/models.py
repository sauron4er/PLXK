from django.db import models
from django.contrib.auth.models import User


class Department(models.Model):
    name = models.CharField(max_length=200)
    text = models.CharField(max_length=4000, blank=True, null=True)
    manager = models.ForeignKey(User, related_name='department_manager', blank=True, null=True, on_delete=models.RESTRICT)
    is_tdv = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.RESTRICT, null=True)
    pip = models.CharField(max_length=100, blank=True, null=True)
    avatar = models.ImageField(upload_to='images/users', verbose_name='Аватар', blank=True, null=True)
    department = models.ForeignKey(Department, blank=True, null=True, on_delete=models.RESTRICT, related_name='+', default=1)
    is_ticked_admin = models.BooleanField(default=False)
    is_orders_admin = models.BooleanField(default=False)
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
    is_correspondence_view = models.BooleanField(default=False)  # Для можливості входу на сторінку "Листування з клієнтами"
    is_correspondence_mail = models.BooleanField(default=False)  # Для отримання пошти про листування з клієнтами
    access_to_all_contracts = models.BooleanField(default=False)  # Доступ до перегляду всіх Договорів
    providers_add = models.BooleanField(default=False)  # Право додавання постачальників
    clients_add = models.BooleanField(default=False)  # Право редагування довідника клієнтів
    product_type_add = models.BooleanField(default=False)  # Право редагування довідника продукції
    mockup_type_add = models.BooleanField(default=False)  # Право редагування довідника типів дизайн-макетів
    scope_add = models.BooleanField(default=False)  # Право редагування довідника сфер застосування
    mockup_product_type_add = models.BooleanField(default=False)  # Право редагування довідника продукції, пов’язаної з типами дизайн-макетів
    stationery_type_add = models.BooleanField(default=False)  # Право редагування довідника канцтоварів
    stationery_orders_view = models.BooleanField(default=False)  # Право перегляду замовлень канцтоварів
    dep_regulations_add = models.BooleanField(default=False)  # Право додавати посадові інструкції та положення про відділ
    contract_subject_edit = models.BooleanField(default=False)  # Право редагувати номенклатуру Предметів Договорів
    corr_template_edit = models.BooleanField(default=False)  # Право редагувати шаблони листування

    is_bets = models.BooleanField(default=False)
    work = models.CharField(max_length=200,blank=True, null=True)
    on_vacation = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    acting = models.ForeignKey('self', blank=True, null=True, on_delete=models.RESTRICT)
    is_hr = models.BooleanField(default=False)  # Для відображення вкладки "Відділ кадрів" в EDMS
    is_pc_user = models.BooleanField(default=True)  # Для відображення користувача на сторінці відділу кадрів у EDMS
    birthday = models.DateField(null=True)

    n_main = models.CharField(max_length=4, null=True, blank=True)
    n_second = models.CharField(max_length=4, null=True, blank=True)
    n_mobile = models.CharField(max_length=4, null=True, blank=True)
    n_out = models.CharField(max_length=11, null=True, blank=True)
    mobile1 = models.CharField(max_length=11, null=True, blank=True)
    mobile2 = models.CharField(max_length=11, null=True, blank=True)
    tab_number = models.CharField(max_length=15, unique=True, null=True)

    delete_from_noms = models.BooleanField(default=False)  # Фізично звільнені, але не ясно,
    # кому передавати їх документи. Ця змінна дає змогу прибрати таких людей зі списків у довідниках

    def __str__(self):
        # return self.user.last_name
        return self.pip

    class Meta:
        verbose_name = 'Профіль'
        verbose_name_plural = 'Профілі'
