from django.db import models
from django.utils import timezone
from accounts import models as accounts  # import models Department, UserProfile

# models, related with users


class Position(models.Model):
    position = models.CharField(max_length=100)
    department_id = models.ForeignKey(accounts.Department, related_name='department')
    chief_id = models.ForeignKey('self', related_name='chief', null=True)
    actual = models.BooleanField(default=True)  # actual is false when user fired or on vacation


class EmployeePosition(models.Model):
    employee_id = models.ForeignKey(accounts.UserProfile, related_name='employee')
    position_id = models.ForeignKey('Position', related_name='employee_position')
    begin_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True)


class Vacation(models.Model):
    employee_id = models.ForeignKey(accounts.UserProfile, related_name='vacation_employee')
    begin_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True)
    acting_id = models.ForeignKey('self', related_name='acting', null=True)  # Acting user, while this on vacation


# models, related with documents and marks


class DocumentType(models.Model):
    document_type = models.CharField(max_length=50)
    description = models.CharField(max_length=1000)


class MarkType(models.Model):
    mark_type = models.CharField(max_length=20)


class Document(models.Model):
    document_type_id = models.ForeignKey(DocumentType, related_name='type')
    title = models.CharField(max_length=100)
    text = models.CharField(max_length=1000)
    image = models.BinaryField(editable=True, null=True)
    closed = models.BooleanField(default=False)


class DocumentTypePermission(models.Model):
    document_type_id = models.ForeignKey(DocumentType, related_name='type_permissions_document_type')
    position_id = models.ForeignKey(Position, related_name='type_permissions_position')
    mark_type_id = models.ForeignKey(MarkType, related_name='type_permissions_mark')
    actual = models.BooleanField(default=True)


class DocumentPermission(models.Model):
    document_id = models.ForeignKey(Document, related_name='document_permission_doc')
    employee_id = models.ForeignKey(accounts.UserProfile, related_name='doc_permissions_employee')
    mark_type_id = models.ForeignKey(MarkType, related_name='doc_permissions_mark')
    actual = models.BooleanField(default=True)


# Document path models


class DocumentPath(models.Model):
    document_id = models.ForeignKey(Document, related_name='document_path_doc')
    employee_id = models.ForeignKey(accounts.UserProfile, related_name='document_path_employee')
    mark_id = models.ForeignKey(MarkType, related_name='document_path_mark')
    timestamp = models.DateTimeField(default=timezone.now)
    comment = models.CharField(max_length=200, blank=True)


class MarkDemand(models.Model):
    document_id = models.ForeignKey(Document, related_name='document')
    employee_control_id = models.ForeignKey(accounts.UserProfile, related_name='employee_control')
    employee_to_mark_id = models.ForeignKey(accounts.UserProfile, related_name='employee_to_mark')
    mark_id = models.ForeignKey(MarkType, related_name='mark_demand_mark')
    result_document_id = models.ForeignKey(Document, related_name='result_document', null=True)
    deadline = models.DateTimeField(null=True)
    done = models.BooleanField(default=False)
    timestamp = models.DateTimeField(null=True)


# Models, related to specific types of documents

class FreeTimePeriods(models.Model):
    document_id = models.ForeignKey(Document, related_name='free_time_doc')
    free_day = models.DateField(default=timezone.now)
    begin_time = models.TimeField(default=timezone.now)
    end_time = models.TimeField(default='17.00')


class CarryOutItems(models.Model):
    document_id = models.ForeignKey(Document, related_name='carry_out_doc')
    item_name = models.CharField(max_length=100)
    quantity = models.IntegerField()
