from django.db import models
from django.utils import timezone
from accounts import models as accounts  # import models Department, UserProfile


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
    successor = models.ForeignKey('self', related_name='heir', null=True, blank=True)  # кому передаються активні документи


class Vacation(models.Model):
    employee = models.ForeignKey(accounts.UserProfile, related_name='vacations')
    begin_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True)
    acting = models.ForeignKey('self', related_name='acting_for', null=True)  # Acting user, while this on vacation


# models, related with documents and marks
class Document_Type(models.Model):
    document_type = models.CharField(max_length=50)
    description = models.CharField(max_length=1000)
    creator = models.ForeignKey(Employee_Seat, related_name='creator', null=True)
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
#       а потім одночасно "Погоджую" директора і "Ознайомлений" охорони
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


# Не буде використовуватися, замінюється Doc_Type_Phase_Queue: видалити
class Document_Type_Permission(models.Model):
    document_type = models.ForeignKey(Document_Type, related_name='with_permissions')
    seat = models.ForeignKey(Seat, related_name='permission_seats')
    mark = models.ForeignKey(Mark, related_name='permission_marks')
    is_active = models.BooleanField(default=True)


class Document(models.Model):
    document_type = models.ForeignKey(Document_Type, related_name='type')
    title = models.CharField(max_length=100, null=True, blank=True)
    text = models.CharField(max_length=1000, null=True, blank=True)
    image = models.BinaryField(editable=True, null=True)
    employee_seat = models.ForeignKey(Employee_Seat, related_name='initiated_documents')
    is_draft = models.BooleanField(default=False)
    closed = models.BooleanField(default=False)  # Закриті документи попадають в архів
    is_active = models.BooleanField(default=True)  # Неактивні документи вважаються видаленими і не показуються ніде
    date = models.DateTimeField(auto_now_add=True, null=True)
    testing = models.BooleanField(default=False)


class Document_Permission(models.Model):
    document = models.ForeignKey(Document, related_name='with_permissions')
    employee = models.ForeignKey(accounts.UserProfile, related_name='doc_permissions')
    mark_type = models.ForeignKey(Mark, related_name='doc_permissions')
    is_active = models.BooleanField(default=True)


# Document path models
class Document_Path(models.Model):
    document = models.ForeignKey(Document, related_name='path')
    employee_seat = models.ForeignKey(Employee_Seat, related_name='documents_path')
    mark = models.ForeignKey(Mark, related_name='documents_path')
    timestamp = models.DateTimeField(default=timezone.now)
    comment = models.CharField(max_length=1000, blank=True)


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
    is_active = models.BooleanField(default=True)


# пункти [наказу]
class Doc_Article(models.Model):
    document = models.ForeignKey(Document, related_name='document_articles')
    number = models.IntegerField(null=True)
    text = models.CharField(max_length=1000)
    deadline = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)


# відповідальні відділи для пунктів [наказу]
class Doc_Article_Dep(models.Model):
    article = models.ForeignKey(Doc_Article, related_name='article_deps')
    department = models.ForeignKey(accounts.Department, related_name='articles_to_response')
    is_active = models.BooleanField(default=True)


# Список погоджуючих. Поле approved - true, false, null (null - коли ще не відреагували)
# Автоматично анулюється, якщо в іншому погодженні до того ж документу поставили "Відмовлено" чи "На доопрацювання".
class Doc_Approval(models.Model):
    document = models.ForeignKey(Document, related_name='document_approvals')
    seat = models.ForeignKey(Seat, related_name='seat_approvals')
    approved = models.NullBooleanField(null=True)
    approved_path = models.ForeignKey(Document_Path, related_name='path_approval', null=True)
    is_active = models.BooleanField(default=True)


# Чинність документу
class Doc_Validity(models.Model):
    document = models.ForeignKey(Document, related_name='document_validity')
    is_valid = models.BooleanField(default=True)
    validity_start = models.DateTimeField(null=True)
    validity_end = models.DateTimeField(null=True)


# Підпис документу [директором]
class Doc_Sign(models.Model):
    document = models.ForeignKey(Document, related_name='document_sign')
    signed = models.BooleanField(default=True)
    sign_path = models.ForeignKey(Document_Path, related_name='path_sign', null=True)


# Унікальна нумерація документу
class Doc_Type_Unique_Number(models.Model):
    document = models.ForeignKey(Document, related_name='document_number')
    number = models.IntegerField(null=True)
    is_active = models.BooleanField(default=True)


# Назва документу
class Doc_Name(models.Model):
    document = models.ForeignKey(Document, related_name='document_name')
    name = models.CharField(max_length=500)
    is_active = models.BooleanField(default=True)


# Преамбула документу
class Doc_Preamble(models.Model):
    document = models.ForeignKey(Document, related_name='document_preamble')
    preamble = models.CharField(max_length=1000)
    is_active = models.BooleanField(default=True)


# Адресат документу
class Doc_Recipient(models.Model):
    document = models.ForeignKey(Document, related_name='doc_recipient')
    recipient = models.ForeignKey(Employee_Seat, related_name='recipient_doc')
    is_active = models.BooleanField(default=True)


# Текст документу
class Doc_Text(models.Model):
    document = models.ForeignKey(Document, related_name='doc_text')
    text = models.CharField(max_length=1000, null=True, blank=True)
    is_active = models.BooleanField(default=True)


# Дата, яка використовується у документі. Н-д, день дії звільнюючої
class Doc_Day(models.Model):
    document = models.ForeignKey(Document, related_name='document_day')
    day = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)


# Номер прохідної (для матеріального пропуску тощо)
class Doc_Gate(models.Model):
    document = models.ForeignKey(Document, related_name='document_gate')
    gate = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)


# Список матеріальних цінностей для матеріального пропуску
class Carry_Out_Items(models.Model):
    document = models.ForeignKey(Document, related_name='carry_documents')
    item_name = models.CharField(max_length=100)
    quantity = models.CharField(max_length=100)
    measurement = models.CharField(max_length=100)
