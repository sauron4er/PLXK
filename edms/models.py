from django.db import models
from django.utils import timezone
from accounts import models as accounts  # import models Department, UserProfile
from production.models import  Mockup_type, Mockup_product_type
from correspondence.models import Client


# models, related with users
class Seat(models.Model):
    seat = models.CharField(max_length=100)
    department = models.ForeignKey(accounts.Department, related_name='positions', null=True, blank=True)
    chief = models.ForeignKey('self', related_name='subordinate', null=True, blank=True)
    is_dep_chief = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.seat


class Employee_Seat(models.Model):
    employee = models.ForeignKey(accounts.UserProfile, related_name='positions')
    seat = models.ForeignKey(Seat, related_name='employees')
    begin_date = models.DateField(null=True, blank=True, default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_main = models.BooleanField(default=True)  # false = в.о.
    acting_for = models.ForeignKey('self', related_name='acting_for_me', null=True, blank=True)  # в.о. замість...
    successor = models.ForeignKey('self', related_name='heir', null=True, blank=True)  # кому передаються активні документи при звільненні


class Vacation(models.Model):
    employee = models.ForeignKey(accounts.UserProfile, related_name='vacations')
    begin = models.DateField(default=timezone.now)
    end = models.DateField(null=True)
    acting = models.ForeignKey(accounts.UserProfile, related_name='acting_for', null=True)  # Acting user, while this on vacation
    started = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)


# models, related with documents and marks
class Document_Type(models.Model):
    document_type = models.CharField(max_length=50)
    description = models.CharField(max_length=1000)
    creator = models.ForeignKey(Employee_Seat, related_name='creator', null=True)
    is_changeable = models.BooleanField(default=False)  # Якщо True, документ можна змінювати після опублікування.
    table_view = models.BooleanField(default=False)  # True - система створює базу цих документів на сторінці tables
    is_active = models.BooleanField(default=True)
    testing = models.BooleanField(default=False)

    def __str__(self):
        return self.description


class Mark(models.Model):
    mark = models.CharField(max_length=20)
    # is_phase - Чи може ця позначка бути фазою?
    # Наприклад, "Закрито" - це не фаза, а лише позначка, яка може поставитися на будь-якій фазі
    is_phase = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)


# Стадії типа документа, із зазначенням черговості і типу позначки
# Н-д:  звільнююча спочатку використовує "Не заперечую" керівника,
# а потім одночасно "Погоджую" директора і "Ознайомлений" охорони
class Doc_Type_Phase(models.Model):
    document_type = models.ForeignKey(Document_Type, related_name='dtm_types')
    mark = models.ForeignKey(Mark, related_name='dtm_marks')
    phase = models.IntegerField()
    required = models.BooleanField(default=True)
    sole = models.BooleanField(
        default=False
    )  # True - документ іде тільки одному зі списку Doc_Type_Phase_Queue (шукається найближчий відповідний керівник)
    is_approve_chained = models.BooleanField(default=False)  # True - вимагає погодження у кожного з ланки керівників аж до отримувача
    testing = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)


# Список посад/людей/людинопосад, до яких надходить документ на тій чи іншій його стадії із зазначенням черговості
class Doc_Type_Phase_Queue(models.Model):
    phase = models.ForeignKey(Doc_Type_Phase, related_name='phases')
    seat = models.ForeignKey(Seat, related_name='phase_seats', null=True)
    employee_seat = models.ForeignKey(Employee_Seat, related_name='phase_emp_seats', null=True)
    queue = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)


class Document(models.Model):
    document_type = models.ForeignKey(Document_Type, related_name='type')
    title = models.CharField(max_length=100, null=True, blank=True)
    text = models.CharField(max_length=1000, null=True, blank=True)
    image = models.BinaryField(editable=True, null=True)
    employee_seat = models.ForeignKey(Employee_Seat, related_name='initiated_documents')
    is_draft = models.BooleanField(default=False)
    is_template = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True, null=True)
    approved = models.NullBooleanField()
    approved_date = models.DateTimeField(blank=True, null=True)
    testing = models.BooleanField(default=False)
    closed = models.BooleanField(default=False)  # Закриті документи попадають в архів
    is_active = models.BooleanField(default=True)  # Неактивні документи вважаються видаленими і не показуються ніде


# Document path models
class Document_Path(models.Model):
    document = models.ForeignKey(Document, related_name='path')
    path_to_answer = models.ForeignKey('self', related_name='answers', null=True, blank=True)
    employee_seat = models.ForeignKey(Employee_Seat, related_name='documents_path')
    mark = models.ForeignKey(Mark, related_name='documents_path')
    timestamp = models.DateTimeField(default=timezone.now)
    comment = models.CharField(max_length=5000, blank=True)


class Mark_Demand(models.Model):
    document = models.ForeignKey(Document, related_name='documents_with_demand')
    document_path = models.ForeignKey(Document_Path, related_name='path_demands', null=True)
    comment = models.CharField(max_length=500, null=True, blank=True)
    employee_seat_control = models.ForeignKey(Employee_Seat, related_name='demands_controled', null=True, blank=True)
    recipient = models.ForeignKey(Employee_Seat, related_name='demands_employees')
    mark = models.ForeignKey(Mark, related_name='demands')
    result_document = models.ForeignKey(Document, related_name='result_document', null=True)
    deadline = models.DateTimeField(null=True)
    phase = models.ForeignKey(Doc_Type_Phase, related_name='md_phase')
    is_active = models.BooleanField(default=True)


class File(models.Model):
    file = models.FileField(upload_to='edms_files/%Y/%m')
    name = models.CharField(max_length=100, null=True, blank=True)
    document_path = models.ForeignKey(Document_Path, related_name='files', null=True)
    first_path = models.BooleanField(True)  # True - файл доданий при створенні документу. Такі файли показуються в основній інфі про документ.
    version = models.IntegerField(default=1)
    deactivate_path = models.ForeignKey(Document_Path, related_name='deactivate_files', null=True)
    is_active = models.BooleanField(default=True)


# ----------------------------------------------------------------------------------------------------------------------
# Модульна система документів:


# Список модулів (прикріплення файлів, погоджуючі, пункти, резолюції тощо)
class Module(models.Model):
    module = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=500, null=True)
    is_active = models.BooleanField(default=True)


# Список модулів конкретних типів документів
class Document_Type_Module(models.Model):
    document_type = models.ForeignKey(Document_Type, related_name='module_types')
    module = models.ForeignKey(Module, related_name='type_modules')
    queue = models.IntegerField()
    field_name = models.CharField(max_length=200)
    required = models.BooleanField(default=False)
    testing = models.BooleanField(default=False)
    # is_tiny_text_box = models.BooleanField(default=False) # True - маленькі текстові поля, н-д номер документа (приймають до 10 символів)
    is_active = models.BooleanField(default=True)
    is_editable = models.BooleanField(default=False)
    table_view = models.BooleanField(default=False)  # True - показує це поле як колонку у зведеній таблиці
    additional_info = models.CharField(max_length=200, null=True)  # Додаткова інфа про модуль, яка показується користувачу


# пункти [наказу]
# class Doc_Article(models.Model):
#     document = models.ForeignKey(Document, related_name='document_articles')
#     number = models.IntegerField(null=True)
#     text = models.CharField(max_length=1000)
#     deadline = models.DateTimeField(null=True, blank=True)
#     is_active = models.BooleanField(default=True)


# відповідальні відділи для пунктів [наказу]
# class Doc_Article_Dep(models.Model):
#     article = models.ForeignKey(Doc_Article, related_name='article_deps')
#     department = models.ForeignKey(accounts.Department, related_name='articles_to_response')
#     is_active = models.BooleanField(default=True)


# Список отримувачів на ознайомлення.
class Doc_Acquaint(models.Model):
    document = models.ForeignKey(Document, related_name='acquaint_list')
    acquaint_emp_seat = models.ForeignKey(Employee_Seat, related_name='emp_seat_acquaints')
    is_active = models.BooleanField(default=True)


# Список отримувачів на ознайомлення.
class Doc_Approval(models.Model):
    document = models.ForeignKey(Document, related_name='approval_list')
    emp_seat = models.ForeignKey(Employee_Seat, related_name='emp_seat_approvals')
    approved = models.NullBooleanField()
    approve_path = models.ForeignKey(Document_Path, related_name='path_approvals', null=True)
    approve_queue = models.IntegerField()   # Черговість подання документа на підпис різним людинопосадам, починаючи з автора (при поверненні переробленого документа, той подається автору на затвердження)
    is_active = models.BooleanField(default=True)


# Чинність документу
# class Doc_Validity(models.Model):
#     document = models.ForeignKey(Document, related_name='document_validity')
#     is_valid = models.BooleanField(default=True)
#     validity_start = models.DateTimeField(null=True)
#     validity_end = models.DateTimeField(null=True)


# Погодження документу
# class Doc_Sign(models.Model):
#     document = models.ForeignKey(Document, related_name='document_sign')
#     signed_path = models.ForeignKey(Document_Path, related_name='path_sign', null=True)
#     is_active = models.BooleanField(default=True)


# Унікальна нумерація документу
# class Doc_Type_Unique_Number(models.Model):
#     document = models.ForeignKey(Document, related_name='document_number')
#     number = models.IntegerField(null=True)
#     is_active = models.BooleanField(default=True)


# Назва документу
# class Doc_Name(models.Model):
#     document = models.ForeignKey(Document, related_name='document_name')
#     name = models.CharField(max_length=500)
#     is_active = models.BooleanField(default=True)


# Адресат документу
class Doc_Recipient(models.Model):
    document = models.ForeignKey(Document, related_name='recipients')
    recipient = models.ForeignKey(Employee_Seat, related_name='recipient_doc')
    is_active = models.BooleanField(default=True)


# Текст документу
class Doc_Text(models.Model):
    document = models.ForeignKey(Document, related_name='texts')
    text = models.CharField(max_length=5000, null=True, blank=True)
    queue_in_doc = models.IntegerField()
    is_active = models.BooleanField(default=True)


# Дата, яка використовується у документі. Н-д, день дії звільнюючої
class Doc_Day(models.Model):
    document = models.ForeignKey(Document, related_name='day')
    day = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)


# Номер прохідної (для матеріального пропуску тощо)
class Doc_Gate(models.Model):
    document = models.ForeignKey(Document, related_name='gate')
    gate = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)


# Список матеріальних цінностей для матеріального пропуску
class Carry_Out_Items(models.Model):
    document = models.ForeignKey(Document, related_name='carry_documents')
    item_name = models.CharField(max_length=100)
    quantity = models.CharField(max_length=100)
    measurement = models.CharField(max_length=100)


# Тип макету
class Doc_Mockup_Type(models.Model):
    document = models.ForeignKey(Document, related_name='mockup_type')
    mockup_type = models.ForeignKey(Mockup_type, related_name='documents')
    is_active = models.BooleanField(default=True)


# Тип продукції (пов’язано з типом макету)
class Doc_Mockup_Product_Type(models.Model):
    document = models.ForeignKey(Document, related_name='mockup_product_type')
    mockup_product_type = models.ForeignKey(Mockup_product_type, related_name='mpt_documents')
    is_active = models.BooleanField(default=True)


# Клієнт
class Doc_Client(models.Model):
    document = models.ForeignKey(Document, related_name='client')
    client = models.ForeignKey(Client, related_name='client_documents')
    is_active = models.BooleanField(default=True)
