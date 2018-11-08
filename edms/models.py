from django.db import models
from django.utils import timezone
from accounts import models as accounts  # import models Department, UserProfile

# models, related with users


class Seat(models.Model):
    seat = models.CharField(max_length=100)
    department = models.ForeignKey(accounts.Department, related_name='positions', null=True, blank=True)
    chief = models.ForeignKey('self', related_name='subordinate', null=True, blank=True)
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

    def __str__(self):
        return self.description


class Mark(models.Model):
    mark = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)


class Document(models.Model):
    document_type = models.ForeignKey(Document_Type, related_name='type')
    title = models.CharField(max_length=100, null=True, blank=True)
    text = models.CharField(max_length=1000, null=True, blank=True)
    image = models.BinaryField(editable=True, null=True)
    employee_seat = models.ForeignKey(Employee_Seat, related_name='initiated_documents')
    closed = models.BooleanField(default=False)


class Document_Type_Permission(models.Model):
    document_type = models.ForeignKey(Document_Type, related_name='with_permissions')
    seat = models.ForeignKey(Seat, related_name='type_permissions')
    mark = models.ForeignKey(Mark, related_name='type_permissions')
    is_active = models.BooleanField(default=True)


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


class Document_Flow(models.Model):
    document = models.ForeignKey(Document, related_name='flow')
    employee_seat = models.ForeignKey(Employee_Seat, related_name='documents_in_flow')
    expected_mark = models.ForeignKey(Mark, related_name='in_flow', null=True, blank=True)
    is_active = models.BooleanField(default=True)


class Mark_Demand(models.Model):
    document = models.ForeignKey(Document, related_name='documents_with_demand')
    document_path = models.ForeignKey(Document_Path, related_name='path_demands', null=True)
    comment = models.CharField(max_length=500, null=True, blank=True)
    employee_seat_control = models.ForeignKey(Employee_Seat, related_name='demands_controled', null=True, blank=True)
    recipient = models.ForeignKey(Employee_Seat, related_name='demands_employees')
    mark = models.ForeignKey(Mark, related_name='demands')
    result_document = models.ForeignKey(Document, related_name='result_document', null=True)
    deadline = models.DateTimeField(null=True)
    is_active = models.BooleanField(default=True)


# Models, related to specific types of documents
class Free_Time_Periods(models.Model):
    document = models.ForeignKey(Document, related_name='free_documents')
    free_day = models.DateField(default=timezone.now)
    begin_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)


class Carry_Out_Items(models.Model):
    document = models.ForeignKey(Document, related_name='carry_documents')
    item_name = models.CharField(max_length=100)
    quantity = models.CharField(max_length=100)
    measurement = models.CharField(max_length=100)


class Carry_Out_Info(models.Model):
    document = models.ForeignKey(Document, related_name='info_documents')
    carry_out_day = models.DateField(default=timezone.now)
    gate = models.IntegerField(default=1)


# SQL Views models

# Модель, створена для обробки view в бд, яка показує список активних документів
class Active_Docs_View(models.Model):
    employee_id = models.IntegerField()
    id = models.IntegerField(primary_key=True)
    date = models.CharField(max_length=100)
    description = models.CharField(max_length=100)
    type_id = models.IntegerField()
    employee_seat_id = models.IntegerField()

    class Meta:
        managed = False     # Для того, щоб модель не враховувалась в міграціях, адже це не справжня таблиця у бд
        db_table = 'edms_active_docs'


# Модель, створена для обробки view в бд, яка показує список документів в архіві
class Archive_Docs_View(models.Model):
    employee_id = models.IntegerField()
    id = models.IntegerField(primary_key=True)
    date = models.CharField(max_length=100)
    description = models.CharField(max_length=100)
    type_id = models.IntegerField()
    employee_seat_id = models.IntegerField()

    class Meta:
        managed = False     # Для того, щоб модель не враховувалась в міграціях, адже це не справжня таблиця у бд
        db_table = 'edms_my_archive_docs'