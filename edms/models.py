from django.db import models
from django.utils import timezone
from accounts import models as accounts  # import models Department, UserProfile
from production.models import Mockup_type, Mockup_product_type, Sub_product_type, Scope, \
    Cost_Rates_Product, Cost_Rates_Nom, Contract_Subject
from correspondence.models import Client, Law
from boards.models import Counterparty
# from docs.models import Contract # - напряму функцію імпортувати не можна, буде помилка circular import


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
    is_deactivatable = models.BooleanField(default=False)  # Якщо True, документ можна "деактивувати", в результаті чого він буде показуватися червоним кольором у звередній таблиці, як не актуальний.
    is_active = models.BooleanField(default=True)
    testing = models.BooleanField(default=False)

    def __str__(self):
        return self.description


class Document_Type_Version(models.Model):
    document_type = models.ForeignKey(Document_Type, related_name='versions', on_delete=models.RESTRICT)
    version_id = models.PositiveSmallIntegerField()
    description = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)


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
    doc_type_version = models.ForeignKey(Document_Type_Version, null=True, related_name='doc_type_phases', on_delete=models.RESTRICT)
    testing = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)


# Список посад/людей/людинопосад, до яких надходить документ на тій чи іншій його стадії із зазначенням черговості
class Doc_Type_Phase_Queue(models.Model):
    phase = models.ForeignKey(Doc_Type_Phase, related_name='phases', on_delete=models.RESTRICT)
    seat = models.ForeignKey(Seat, related_name='phase_seats', null=True, on_delete=models.RESTRICT)
    employee_seat = models.ForeignKey(Employee_Seat, related_name='phase_emp_seats', null=True, on_delete=models.RESTRICT)
    queue = models.IntegerField(default=0)
    doc_type_version = models.CharField(max_length=2, null=True)  # Підтип документу
    is_active = models.BooleanField(default=True)


class Document(models.Model):
    document_type = models.ForeignKey(Document_Type, related_name='type', on_delete=models.RESTRICT)
    title = models.CharField(max_length=100, null=True, blank=True)
    # author = models.ForeignKey(Employee_Seat, related_name='initiated_documents', on_delete=models.RESTRICT, null=True)
    employee_seat = models.ForeignKey(Employee_Seat, related_name='responsible_for_documents', on_delete=models.RESTRICT)  # Відповідальний
    is_draft = models.BooleanField(default=False)
    is_template = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True, null=True)
    approved = models.BooleanField(null=True)
    approved_date = models.DateTimeField(blank=True, null=True)
    company = models.CharField(max_length=3, null=True, blank=True, default='ТДВ')  # ТОВ або ТДВ
    testing = models.BooleanField(default=False)
    stage = models.CharField(max_length=7, null=True)  # 'in work', 'denied', 'done', 'confirm' None (created)
    closed = models.BooleanField(default=False)  # Закриті документи попадають в архів
    # doc_type_version = models.CharField(max_length=2, null=True)  # Підтип документу
    doc_type_version = models.ForeignKey(Document_Type_Version, null=True, related_name='documents', on_delete=models.RESTRICT)  # Підтип документу

    # TODO При записі документа записуємо перші 50 символів з main_field у це поле.
    #  При пошуку документа для таблиці беремо дані з цього поля
    main_field = models.CharField(max_length=50, null=True)  # Записуємо сюди перші 50 символів Змісту, для легкого пошуку і фільтрації

    is_active = models.BooleanField(default=True)  # Неактивні документи вважаються видаленими і не показуються ніде


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
    delegated_from = models.ForeignKey(Employee_Seat, related_name='delegated', null=True, blank=True, on_delete=models.RESTRICT)
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


# Доступ користувачів до перегляду усіх документів певного типу
class User_Doc_Type_View(models.Model):
    employee = models.ForeignKey(accounts.UserProfile, related_name='view_doc_types_permissions', on_delete=models.RESTRICT)
    meta_doc_type = models.ForeignKey(Document_Meta_Type, related_name='users_with_view_permission', on_delete=models.RESTRICT)
    send_mails = models.BooleanField(default=False)  # Надсилання листів про створення нових документів/зміну статусу
    super_manager = models.BooleanField(default=False)  # Право ставити позначки замість виконуючих (н-д, заявки)
    is_active = models.BooleanField(default=True)


class Doc_Type_Create_Rights(models.Model):
    document_meta_type = models.ForeignKey(Document_Meta_Type, related_name='create_rights', on_delete=models.CASCADE)
    department = models.ForeignKey(accounts.Department, related_name='doc_type_create_rights', null=True, on_delete=models.CASCADE)
    seat = models.ForeignKey(Seat, null=True, related_name='doc_type_create_rights', on_delete=models.CASCADE)
    emp_seat = models.ForeignKey(Employee_Seat, null=True, related_name='doc_type_create_rights', on_delete=models.CASCADE)
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
    defines_doc_version = models.BooleanField(default=False)  # True - цей модуль визначає версію документа, н-д вибір підприємства у Тендерах

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
    hide = models.BooleanField(default=False)  # True ховає модуль з вікна створення нового документа (наприклад модуль stage)
    doc_type_version = models.ForeignKey(Document_Type_Version,
                                         related_name='type_modules',
                                         on_delete=models.RESTRICT, null=True) # Якщо версія не вказана, модуль відноситься до всіх


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
class Doc_Employee(models.Model):  # Співробітник заводу
    document = models.ForeignKey(Document, related_name='employees', on_delete=models.RESTRICT)
    employee = models.ForeignKey(accounts.UserProfile, related_name='documents', on_delete=models.RESTRICT)
    queue_in_doc = models.IntegerField()
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


# Дата, яка використовується у документі.
class Doc_Day(models.Model):
    document = models.ForeignKey(Document, related_name='days', on_delete=models.RESTRICT)
    day = models.DateField(default=timezone.now)
    queue_in_doc = models.IntegerField()
    is_active = models.BooleanField(default=True)


# Дата і час прохідна
class Doc_Foyer_Range(models.Model):
    document = models.ForeignKey(Document, related_name='foyer_ranges', on_delete=models.RESTRICT)
    out_datetime = models.DateTimeField(null=True)
    in_datetime = models.DateTimeField(null=True)
    queue_in_doc = models.IntegerField(null=True)
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
    document = models.ForeignKey(Document, related_name='clients', on_delete=models.RESTRICT)
    client = models.ForeignKey(Client, related_name='client_documents', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


# Контрагент
class Doc_Counterparty(models.Model):
    document = models.ForeignKey(Document, related_name='counterparty', on_delete=models.RESTRICT)
    counterparty = models.ForeignKey(Counterparty, related_name='edms_documents', on_delete=models.RESTRICT, null=True)
    counterparty_input = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)


# Договір (як Основний Договір у погодженні Договору)
class Doc_Contract(models.Model):
    document = models.ForeignKey(Document, related_name='contract', on_delete=models.RESTRICT)
    contract_id = models.IntegerField()
    is_active = models.BooleanField(default=True)


# Підпродукція (в ній же можна знайти інфу і про продукцію)
class Doc_Sub_Product(models.Model):
    document = models.ForeignKey(Document, related_name='sub_product_type', on_delete=models.RESTRICT)
    sub_product_type = models.ForeignKey(Sub_product_type, related_name='documents', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


# Сфера застосування продукції
class Doc_Scope(models.Model):
    document = models.ForeignKey(Document, related_name='scope', on_delete=models.RESTRICT)
    scope = models.ForeignKey(Scope, related_name='documents', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


# Законодавство
class Doc_Law(models.Model):
    document = models.ForeignKey(Document, related_name='law', on_delete=models.RESTRICT)
    law = models.ForeignKey(Law, related_name='documents', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


# Посилання на інший документ
class Doc_Doc_Link(models.Model):
    document = models.ForeignKey(Document, related_name='doc_links', on_delete=models.RESTRICT)
    document_link = models.ForeignKey(Document, related_name='links_for', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


# Реєстраційний номер
class Doc_Registration(models.Model):
    document = models.ForeignKey(Document, related_name='doc_registration', on_delete=models.RESTRICT)
    registration_number = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)


# Вимоги клієнта
class Client_Requirements(models.Model):
    document = models.ForeignKey(Document, related_name='client_requirements', on_delete=models.RESTRICT)
    type = models.CharField(max_length=10)
    bag_name = models.CharField(max_length=100, null=True, blank=True)
    weight_kg = models.CharField(max_length=10, null=True, blank=True)
    mf_water = models.CharField(max_length=10, null=True, blank=True)
    mf_ash = models.CharField(max_length=10, null=True, blank=True)
    mf_evaporable = models.CharField(max_length=10, null=True, blank=True)
    mf_not_evaporable_carbon = models.CharField(max_length=10, null=True, blank=True)
    main_faction = models.CharField(max_length=10, null=True, blank=True)
    granulation_lt5 = models.CharField(max_length=10, null=True, blank=True)
    granulation_lt10 = models.CharField(max_length=10, null=True, blank=True)
    granulation_lt20 = models.CharField(max_length=10, null=True, blank=True)
    granulation_lt25 = models.CharField(max_length=10, null=True, blank=True)
    granulation_lt40 = models.CharField(max_length=10, null=True, blank=True)
    granulation_mt20 = models.CharField(max_length=10, null=True, blank=True)
    granulation_mt60 = models.CharField(max_length=10, null=True, blank=True)
    granulation_mt80 = models.CharField(max_length=10, null=True, blank=True)
    appearance = models.CharField(max_length=10, null=True, blank=True)
    color = models.CharField(max_length=10, null=True, blank=True)
    density = models.CharField(max_length=10, null=True, blank=True)
    mf_basic = models.CharField(max_length=10, null=True, blank=True)
    mf_ethanol = models.CharField(max_length=10, null=True, blank=True)
    mf_acids = models.CharField(max_length=10, null=True, blank=True)
    mf_not_evaporable_residue = models.CharField(max_length=10, null=True, blank=True)
    smell = models.CharField(max_length=10, null=True, blank=True)
    color_APHA = models.CharField(max_length=10, null=True, blank=True)
    dry_residue = models.CharField(max_length=10, null=True, blank=True)
    mf_ethanol_ppm = models.CharField(max_length=10, null=True, blank=True)
    methanol_ppm = models.CharField(max_length=10, null=True, blank=True)
    isopropanol_ppm = models.CharField(max_length=10, null=True, blank=True)
    benzol_ppm = models.CharField(max_length=10, null=True, blank=True)
    toluene_ppm = models.CharField(max_length=10, null=True, blank=True)
    ethylmethyl_ketone_ppm = models.CharField(max_length=10, null=True, blank=True)
    other_identified_impurities_ppm = models.CharField(max_length=10, null=True, blank=True)
    unidentified_impurities_ppm = models.CharField(max_length=10, null=True, blank=True)
    brand_of_resin = models.CharField(max_length=10, null=True, blank=True)
    mf_dry_residue = models.CharField(max_length=10, null=True, blank=True)
    mf_free_formaldehyde = models.CharField(max_length=10, null=True, blank=True)
    conditional_viscosity = models.CharField(max_length=10, null=True, blank=True)
    hydrogen_ions = models.CharField(max_length=10, null=True, blank=True)
    gelatinization_time = models.CharField(max_length=10, null=True, blank=True)
    miscibility_with_water = models.CharField(max_length=10, null=True, blank=True)
    warranty_period = models.CharField(max_length=10, null=True, blank=True)
    TU = models.CharField(max_length=10, null=True, blank=True)
    binding = models.CharField(max_length=20, null=True, blank=True)
    is_active = models.BooleanField(default=True)


# Вимоги клієнта
class Client_Requirement_Additional(models.Model):
    client_requirements = models.ForeignKey(Client_Requirements, related_name='additional_requirements', on_delete=models.RESTRICT)
    name = models.CharField(max_length=200, null=True, blank=True)
    requirement = models.CharField(max_length=50, null=True, blank=True)
    is_active = models.BooleanField(default=True)


# ---------------------------------------------------------------------------------------------------------------------
# Норми витрат
class Cost_Rates(models.Model):
    document = models.ForeignKey(Document, related_name='cost_rates', on_delete=models.RESTRICT)
    type = models.CharField(max_length=1)  # o - Основні, t - Тимчасові, p - Для планування
    accounting = models.CharField(max_length=1)  # b - Бухгалтерський облік, u - Управлінський облік
    product_type = models.CharField(max_length=1)  # n - Напівфабрикати, p - Готова продукція
    product = models.ForeignKey(Cost_Rates_Product, related_name='cost_rates', on_delete=models.RESTRICT)
    client = models.ForeignKey(Counterparty, related_name='cost_rates', on_delete=models.RESTRICT, null=True)
    date_start = models.DateField(null=True)
    signed = models.BooleanField(null=True)
    is_active = models.BooleanField(default=True)


# Підв'язка конкретних норм до конкретного створеного документу
class Cost_Rates_Rate(models.Model):
    cost_rates = models.ForeignKey(Cost_Rates, related_name='fields', on_delete=models.RESTRICT)
    name = models.ForeignKey(Cost_Rates_Nom, related_name='cost_rates', on_delete=models.RESTRICT)
    term = models.CharField(max_length=10, null=True, blank=True)
    norm = models.CharField(max_length=10, null=True, blank=True)
    comment = models.CharField(max_length=200, null=True, blank=True)


# Додаткові норми, створені автором
class Cost_Rates_Additional(models.Model):
    cost_rates = models.ForeignKey(Cost_Rates, related_name='additional_fields', on_delete=models.RESTRICT)
    name = models.CharField(max_length=100)
    unit = models.CharField(max_length=10)
    term = models.CharField(max_length=10, null=True, blank=True)
    norm = models.CharField(max_length=10, null=True, blank=True)
    comment = models.CharField(max_length=200, null=True, blank=True)
    is_active = models.BooleanField(default=True)


# ---------------------------------------------------------------------------------------------------------------------
# Foyer
class Foyer(models.Model):
    employee = models.ForeignKey(accounts.UserProfile, related_name='foyer', on_delete=models.RESTRICT)
    out_datetime = models.DateTimeField(null=True)
    in_datetime = models.DateTimeField(null=True)
    absence_based = models.BooleanField()  # True: Звільнююча, рахується час відсутності, False: навпаки
    edms_doc = models.ForeignKey(Document, related_name='foyer', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


# ---------------------------------------------------------------------------------------------------------------------
# Contract Subject Nomenclature

# Список людинопосад, яким відправляється документ на візування в залежності від предмету
class Contract_Subject_Approval(models.Model):
    subject = models.ForeignKey(Contract_Subject, related_name='approval_recipients', on_delete=models.RESTRICT)
    recipient = models.ForeignKey(Employee_Seat, related_name='approval_for_contract_subject', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


# Список людинопосад, яким відправляється документ на прийом у роботу в залежності від предмету
class Contract_Subject_To_Work(models.Model):
    subject = models.ForeignKey(Contract_Subject, related_name='to_work_recipients', on_delete=models.RESTRICT)
    recipient = models.ForeignKey(Employee_Seat, related_name='to_work_for_contract_subject', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)

# ---------------------------------------------------------------------------------------------------------------------
