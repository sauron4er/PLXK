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
    begin_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True)
    is_active = models.BooleanField(default=True)


class Vacation(models.Model):
    employee = models.ForeignKey(accounts.UserProfile, related_name='vacations')
    begin_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True)
    acting = models.ForeignKey('self', related_name='acting_for', null=True)  # Acting user, while this on vacation


# models, related with documents and marks


class Document_Type(models.Model):
    document_type = models.CharField(max_length=50)
    description = models.CharField(max_length=1000)


class Mark(models.Model):
    mark = models.CharField(max_length=20)


class Document(models.Model):
    document_type_id = models.ForeignKey(Document_Type, related_name='type')
    title = models.CharField(max_length=100)
    text = models.CharField(max_length=1000)
    image = models.BinaryField(editable=True, null=True)
    closed = models.BooleanField(default=False)


class Document_Type_Permission(models.Model):
    document_type = models.ForeignKey(Document_Type, related_name='with_permissions')
    seat = models.ForeignKey(Seat, related_name='type_permissions')
    mark_type = models.ForeignKey(Mark, related_name='type_permissions')
    is_active = models.BooleanField(default=True)


class Document_Permission(models.Model):
    document = models.ForeignKey(Document, related_name='with_permissions')
    employee = models.ForeignKey(accounts.UserProfile, related_name='doc_permissions')
    mark_type = models.ForeignKey(Mark, related_name='doc_permissions')
    is_active = models.BooleanField(default=True)


# Document path models


class Document_Path(models.Model):
    document = models.ForeignKey(Document, related_name='path')
    employee = models.ForeignKey(accounts.UserProfile, related_name='documents')
    mark = models.ForeignKey(Mark, related_name='documents_path')
    timestamp = models.DateTimeField(default=timezone.now)
    comment = models.CharField(max_length=200, blank=True)


class Mark_Demand(models.Model):
    document = models.ForeignKey(Document, related_name='documents_with_demand')
    employee_control = models.ForeignKey(accounts.UserProfile, related_name='demands_controled')
    employee_to_mark = models.ForeignKey(accounts.UserProfile, related_name='demands_to_do')
    mark = models.ForeignKey(Mark, related_name='demands')
    result_document = models.ForeignKey(Document, related_name='result_document', null=True)
    deadline = models.DateTimeField(null=True)
    done = models.BooleanField(default=False)
    timestamp = models.DateTimeField(null=True)


# Models, related to specific types of documents

class Free_Time_Periods(models.Model):
    document = models.ForeignKey(Document, related_name='free_documents')
    free_day = models.DateField(default=timezone.now)
    begin_time = models.TimeField(default=timezone.now)
    end_time = models.TimeField(default='17.00')


class Carry_Out_Items(models.Model):
    document = models.ForeignKey(Document, related_name='carry_documents')
    item_name = models.CharField(max_length=100)
    quantity = models.IntegerField()
