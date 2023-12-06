from django.db import models
from django.contrib.auth.models import User
from accounts.models import Department
import edms.models as edms
from boards.models import Counterparty


class Doc_group(models.Model):
    name = models.CharField(max_length=50)
    def __str__(self):
        return self.name


class Doc_type(models.Model):
    name = models.CharField(max_length=50)
    def __str__(self):
        return self.name


class Document(models.Model):
    name = models.CharField(max_length=500)
    doc_type = models.ForeignKey(Doc_type, related_name='Documents', on_delete=models.RESTRICT)
    doc_group = models.ForeignKey(Doc_group, related_name='Documents', on_delete=models.RESTRICT)
    code = models.CharField(max_length=100, null=True, blank=True)
    doc_file = models.FileField(upload_to='docs/%Y/%m')
    act = models.CharField(max_length=50, null=True, blank=True)
    actuality = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, related_name='+', on_delete=models.RESTRICT)
    updated_by = models.ForeignKey(User, null=True, blank=True, related_name='+', on_delete=models.RESTRICT)
    date_start = models.DateField(null=True)
    date_fin = models.DateField(null=True)
    author = models.CharField(max_length=100, null=True, blank=True)
    responsible = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Ct(models.Model):
    dt = models.DateTimeField(null=True,blank=True,auto_now_add=True)
    u = models.ForeignKey(User, related_name='+', blank=True, on_delete=models.RESTRICT)


class Order_doc_type(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Order_doc(models.Model):
    company = models.CharField(max_length=3, default='ТДВ')
    name = models.CharField(max_length=500)
    preamble = models.CharField(max_length=5000, null=True)
    doc_type = models.ForeignKey(Order_doc_type, related_name='Documents', on_delete=models.RESTRICT)
    code = models.CharField(max_length=100, null=True, blank=True)
    cancels_code = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, related_name='added_orders', on_delete=models.RESTRICT)
    updated_by = models.ForeignKey(User, null=True, blank=True, related_name='updated_orders', on_delete=models.RESTRICT)
    date_start = models.DateField(null=True)
    date_canceled = models.DateField(null=True, blank=True)
    canceled_by = models.ForeignKey('self', related_name='cancels_order', null=True, blank=True, on_delete=models.RESTRICT)
    cancels = models.ForeignKey('self', related_name='cancelled_by_order', null=True, blank=True, on_delete=models.RESTRICT)
    author = models.ForeignKey(User, related_name='Created_documents', on_delete=models.RESTRICT)
    responsible = models.ForeignKey(User, related_name='responsible_for_documents', null=True, blank=True, on_delete=models.RESTRICT)
    supervisory = models.ForeignKey(User, related_name='supervisory_for_documents', null=True, blank=True, on_delete=models.RESTRICT)
    edms_doc = models.ForeignKey(edms.Document, related_name='created_order', null=True, on_delete=models.RESTRICT)  # посилання на документ в edms, яким було створено цей Наказ
    done = models.BooleanField(default=False)
    is_act = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class File(models.Model):
    file = models.FileField(upload_to='order_docs/%Y/%m')
    name = models.CharField(max_length=100, null=True, blank=True)
    order = models.ForeignKey(Order_doc, related_name='files', null=True, on_delete=models.RESTRICT)
    is_added_or_canceled = models.BooleanField(default=True)  # True - додані наказом документи, False - скасовані наказом документи
    is_active = models.BooleanField(default=True)


class Order_article(models.Model):
    order = models.ForeignKey(Order_doc, related_name='articles', on_delete=models.RESTRICT)
    text = models.CharField(max_length=7000)
    term = models.CharField(max_length=8, default='term')  # 'term', 'constant', 'no_term'
    deadline = models.DateField(null=True, blank=True)
    periodicity = models.CharField(max_length=1, null=True, blank=True)  # null - одноразовий пункт, 'm' - щомісяця, 'y' - щороку
    done = models.BooleanField(default=False)
    first_instance = models.ForeignKey('self', related_name='next_instances', null=True, blank=True, on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Article_responsible(models.Model):
    article = models.ForeignKey(Order_article, related_name='responsibles', on_delete=models.RESTRICT)
    employee_seat = models.ForeignKey(edms.Employee_Seat, related_name='orders_articles_responsible', on_delete=models.RESTRICT)
    comment = models.CharField(max_length=500, null=True, blank=True)
    done = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)


class Responsible_file(models.Model):
    file = models.FileField(upload_to='order_docs/responsibles/%Y/%m')
    name = models.CharField(max_length=100, null=True, blank=True)
    responsible = models.ForeignKey(Article_responsible, related_name='files', null=True, on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Contract(models.Model):
    # Не можна перейменовувати ці поля, це вплине на автоматичний переніс Договорів з системи EDMS
    number = models.CharField(max_length=100, null=True, blank=True)
    company = models.CharField(max_length=3, null=True, blank=True, default='ТДВ')  # ТОВ або ТДВ
    counterparty_link = models.ForeignKey(Counterparty, related_name='contracts', on_delete=models.RESTRICT, null=True)
    created_by = models.ForeignKey(User, related_name='added_contracts', on_delete=models.RESTRICT)
    updated_by = models.ForeignKey(User, null=True, blank=True, related_name='updated_contracts', on_delete=models.RESTRICT)
    subject = models.CharField(max_length=1000)
    counterparty = models.CharField(max_length=200, null=True)  # Заповнюється якшо не можна взяти контрагента з довідника
    nomenclature_group = models.CharField(max_length=100, null=True, blank=True)
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)
    responsible = models.ForeignKey(User, null=True, blank=True, related_name='responsible_for_contracts', on_delete=models.RESTRICT)
    department = models.ForeignKey(Department, related_name='contracts', null=True, blank=True, on_delete=models.RESTRICT)
    lawyers_received = models.BooleanField(default=False)
    edms_doc = models.ForeignKey(edms.Document, related_name='created_contract', null=True, on_delete=models.RESTRICT)  # посилання на документ в edms, яким було створено цей Договір (для отримання тим документом файлів для історії)
    incoterms = models.CharField(max_length=5000, null=True)
    purchase_terms = models.CharField(max_length=5000, null=True)
    basic_contract = models.ForeignKey('self', related_name='additional_contracts', null=True, blank=True, on_delete=models.RESTRICT)
    # Якщо це поле пусте, то документ є основним договором,
    # в іншому разі це додаткова угода і це поле вказує на основний договір

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.subject


class Contract_File(models.Model):
    file = models.FileField(upload_to='contract_docs/%Y/%m')
    name = models.CharField(max_length=100, null=True, blank=True)
    contract = models.ForeignKey(Contract, related_name='files', null=True, on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)
