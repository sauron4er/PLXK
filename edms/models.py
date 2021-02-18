from django.db import models
from django.utils import timezone
from accounts import models as accounts  # import models Department, UserProfile
from production.models import Mockup_type, Mockup_product_type
from correspondence.models import Client
# from docs.models import Contract # - напряму функцію імпортувати не можна, буде помилка circular import
# import docs.models as docs


# models, related with users
class Seat(models.Model):
    seat = models.CharField(max_length=100)
    department = models.ForeignKey(accounts.Department, related_name='positions', null=True, blank=True, on_delete=models.RESTRICT)
    chief = models.ForeignKey('self', related_name='subordinate', null=True, blank=True, on_delete=models.RESTRICT)
    is_dep_chief = models.BooleanField(default=False)
    instructions_file = models.FileField(upload_to='boards/org_structure/%Y/%m', null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.seat


class Employee_Seat(models.Model):
    employee = models.ForeignKey(accounts.UserProfile, related_name='positions', on_delete=models.RESTRICT)
    seat = models.ForeignKey(Seat, related_name='employees', on_delete=models.RESTRICT)
    begin_date = models.DateField(null=True, blank=True, default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_main = models.BooleanField(default=True)  # false = в.о.
    acting_for = models.ForeignKey('self', related_name='acting_for_me', null=True, blank=True, on_delete=models.RESTRICT)  # в.о. замість...
    successor = models.ForeignKey('self', related_name='heir', null=True, blank=True, on_delete=models.RESTRICT)  # кому передаються активні документи при звільненні


class Vacation(models.Model):
    employee = models.ForeignKey(accounts.UserProfile, related_name='vacations', on_delete=models.RESTRICT)
    begin = models.DateField(default=timezone.now)
    end = models.DateField(null=True)
    acting = models.ForeignKey(accounts.UserProfile, related_name='acting_for', null=True, on_delete=models.RESTRICT)  # Acting user, while this on vacation
    started = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)


# Клас Мета_тип, створений для того, щоб можна було об’єднувати різні версії однакових типів документів в зведених таблицях.
# Наприклад якщо у документі помінялися місцями два поля, то треба створювати новий тип з іншим queue полей.
# А в архіві обидва ці типи (старий і новий - змінений) будуть показуватися під однією назвою.
class Document_Meta_Type(models.Model):
    document_type = models.CharField(max_length=50)
    description = models.CharField(max_length=100)
    table_view = models.BooleanField(default=False)  # True - система створює базу цих документів на сторінці tables
    testing = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)


class Document_Type(models.Model):
    document_type = models.CharField(max_length=50)
    meta_doc_type = models.ForeignKey(Document_Meta_Type, related_name='doc_types', null=True, on_delete=models.RESTRICT)
    description = models.CharField(max_length=1000)
    creator = models.ForeignKey(Employee_Seat, related_name='creator', null=True, on_delete=models.RESTRICT)
    is_changeable = models.BooleanField(default=False)  # Якщо True, документ можна змінювати після опублікування.
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
    document_type = models.ForeignKey(Document_Type, related_name='dtm_types', on_delete=models.RESTRICT)
    mark = models.ForeignKey(Mark, related_name='dtm_marks', on_delete=models.RESTRICT)
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
    phase = models.ForeignKey(Doc_Type_Phase, related_name='phases', on_delete=models.RESTRICT)
    seat = models.ForeignKey(Seat, related_name='phase_seats', null=True, on_delete=models.RESTRICT)
    employee_seat = models.ForeignKey(Employee_Seat, related_name='phase_emp_seats', null=True, on_delete=models.RESTRICT)
    queue = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)


class Document(models.Model):
    document_type = models.ForeignKey(Document_Type, related_name='type', on_delete=models.RESTRICT)
    title = models.CharField(max_length=100, null=True, blank=True)
    employee_seat = models.ForeignKey(Employee_Seat, related_name='initiated_documents', on_delete=models.RESTRICT)
    is_draft = models.BooleanField(default=False)
    is_template = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True, null=True)
    approved = models.BooleanField(null=True)
    approved_date = models.DateTimeField(blank=True, null=True)
    company = models.CharField(max_length=3, null=True, blank=True, default='ТДВ')  # ТОВ або ТДВ
    testing = models.BooleanField(default=False)
    stage = models.CharField(max_length=7, null=True)  # 'in work', 'denied', 'done', 'confirm' None (created)
    closed = models.BooleanField(default=False)  # Закриті документи попадають в архів
    is_active = models.BooleanField(default=True)  # Неактивні документи вважаються видаленими і не показуються ніде


# Document path models
class Document_Path(models.Model):
    document = models.ForeignKey(Document, related_name='path', on_delete=models.RESTRICT)
    path_to_answer = models.ForeignKey('self', related_name='answers', null=True, blank=True, on_delete=models.RESTRICT)
    employee_seat = models.ForeignKey(Employee_Seat, related_name='documents_path', on_delete=models.RESTRICT)
    mark = models.ForeignKey(Mark, related_name='documents_path', on_delete=models.RESTRICT)
    timestamp = models.DateTimeField(default=timezone.now)
    comment = models.CharField(max_length=5000, blank=True)


class Mark_Demand(models.Model):
    document = models.ForeignKey(Document, related_name='document_demands', on_delete=models.RESTRICT)
    document_path = models.ForeignKey(Document_Path, related_name='path_demands', null=True, on_delete=models.RESTRICT)
    comment = models.CharField(max_length=5000, null=True, blank=True)
    employee_seat_control = models.ForeignKey(Employee_Seat, related_name='demands_controled', null=True, blank=True, on_delete=models.RESTRICT)
    recipient = models.ForeignKey(Employee_Seat, related_name='demands_employees', on_delete=models.RESTRICT)
    mark = models.ForeignKey(Mark, related_name='mark_demands', on_delete=models.RESTRICT)
    result_document = models.ForeignKey(Document, related_name='result_document', null=True, on_delete=models.RESTRICT)
    deadline = models.DateTimeField(null=True)
    phase = models.ForeignKey(Doc_Type_Phase, related_name='md_phase', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class File(models.Model):
    file = models.FileField(upload_to='edms_files/%Y/%m')
    name = models.CharField(max_length=100, null=True, blank=True)
    document_path = models.ForeignKey(Document_Path, related_name='files', null=True, on_delete=models.RESTRICT)
    first_path = models.BooleanField(True)  # True - файл доданий при створенні документу. Такі файли показуються в основній інфі про документ.
    version = models.IntegerField(default=1)
    deactivate_path = models.ForeignKey(Document_Path, related_name='deactivate_files', null=True, on_delete=models.RESTRICT)
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
    document_type = models.ForeignKey(Document_Type, related_name='module_types', on_delete=models.RESTRICT)
    module = models.ForeignKey(Module, related_name='type_modules', on_delete=models.RESTRICT)
    queue = models.IntegerField()
    field = models.CharField(max_length=200, null=True, blank=True)

    # Назва поля (наразі для текстових та дат), якщо це поле використовується декілька раз у документі,
    # а потім використовується поза системою edms
    field_name = models.CharField(max_length=200)

    # main_field - Текст з цього поля показується в інфі про документ у таблиці документів.
    is_main_field = models.BooleanField(default=False)

    required = models.BooleanField(default=False)
    testing = models.BooleanField(default=False)
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
    document = models.ForeignKey(Document, related_name='acquaint_list', on_delete=models.RESTRICT)
    acquaint_emp_seat = models.ForeignKey(Employee_Seat, related_name='emp_seat_acquaints', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


# Список отримувачів на ознайомлення.
class Doc_Approval(models.Model):
    document = models.ForeignKey(Document, related_name='approval_list', on_delete=models.RESTRICT)
    emp_seat = models.ForeignKey(Employee_Seat, related_name='emp_seat_approvals', on_delete=models.RESTRICT)
    approved = models.BooleanField(null=True)
    approve_path = models.ForeignKey(Document_Path, related_name='path_approvals', null=True, on_delete=models.RESTRICT)
    approve_queue = models.IntegerField()   # Черговість подання документа на підпис різним людинопосадам, починаючи з автора (при поверненні переробленого документа, той подається автору на затвердження)
    is_active = models.BooleanField(default=True)


# Адресат документу
class Doc_Recipient(models.Model):
    document = models.ForeignKey(Document, related_name='recipients', on_delete=models.RESTRICT)
    recipient = models.ForeignKey(Employee_Seat, related_name='recipient_doc', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


# Текст документу
class Doc_Text(models.Model):
    document = models.ForeignKey(Document, related_name='texts', on_delete=models.RESTRICT)
    text = models.CharField(max_length=5000, null=True, blank=True)
    queue_in_doc = models.IntegerField()
    is_active = models.BooleanField(default=True)


# Дата, яка використовується у документі. Н-д, день дії звільнюючої
class Doc_Day(models.Model):
    document = models.ForeignKey(Document, related_name='days', on_delete=models.RESTRICT)
    day = models.DateField(default=timezone.now)
    queue_in_doc = models.IntegerField()
    is_active = models.BooleanField(default=True)


# Номер прохідної (для матеріального пропуску тощо)
class Doc_Gate(models.Model):
    document = models.ForeignKey(Document, related_name='gate', on_delete=models.RESTRICT)
    gate = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)


# Список матеріальних цінностей для матеріального пропуску
class Carry_Out_Items(models.Model):
    document = models.ForeignKey(Document, related_name='carry_documents', on_delete=models.RESTRICT)
    item_name = models.CharField(max_length=100)
    quantity = models.CharField(max_length=100)
    measurement = models.CharField(max_length=100)


# Тип макету
class Doc_Mockup_Type(models.Model):
    document = models.ForeignKey(Document, related_name='mockup_type', on_delete=models.RESTRICT)
    mockup_type = models.ForeignKey(Mockup_type, related_name='documents', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


# Тип продукції (пов’язано з типом макету)
class Doc_Mockup_Product_Type(models.Model):
    document = models.ForeignKey(Document, related_name='mockup_product_type', on_delete=models.RESTRICT)
    mockup_product_type = models.ForeignKey(Mockup_product_type, related_name='mpt_documents', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


# Клієнт
class Doc_Client(models.Model):
    document = models.ForeignKey(Document, related_name='client', on_delete=models.RESTRICT)
    client = models.ForeignKey(Client, related_name='client_documents', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


# Договір (як Основний Договір у погодженні Договору)
class Doc_Contract(models.Model):
    document = models.ForeignKey(Document, related_name='contract', on_delete=models.RESTRICT)
    contract_id = models.IntegerField()
    is_active = models.BooleanField(default=True)


# Доступ користувачів до перегляду усіх документів певного типу
class User_Doc_Type_View(models.Model):
    employee = models.ForeignKey(accounts.UserProfile, related_name='view_doc_types_permissions', on_delete=models.RESTRICT)
    meta_doc_type = models.ForeignKey(Document_Meta_Type, related_name='users_with_view_permission', null=True, on_delete=models.RESTRICT)
    send_mails = models.BooleanField(default=False)  # Надсилання листів про створення нових документів/зміну статусу
    is_active = models.BooleanField(default=True)


class Doc_Type_Create_Rights(models.Model):
    document_meta_type = models.ForeignKey(Document_Meta_Type, related_name='create_rights', on_delete=models.CASCADE)
    department = models.ForeignKey(accounts.Department, related_name='doc_type_create_rights', null=True, on_delete=models.CASCADE)
    seat = models.ForeignKey(Seat, null=True, related_name='doc_type_create_rights', on_delete=models.CASCADE)
    emp_seat = models.ForeignKey(Employee_Seat, null=True, related_name='doc_type_create_rights', on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
