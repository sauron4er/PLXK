from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from accounts.models import UserProfile, Department
from production.models import Product_type, Certification_type, Scope, Product


class Board(models.Model):
    name = models.CharField(max_length=30, unique=True)
    description = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Topic(models.Model):
    subject = models.CharField(max_length=255)
    last_updated = models.DateTimeField(auto_now_add=True)
    board = models.ForeignKey(Board, related_name='topics', on_delete=models.RESTRICT)
    starter = models.ForeignKey(User, related_name='topics', on_delete=models.RESTRICT)


class Post(models.Model):
    message = models.TextField(max_length=4000)
    topic = models.ForeignKey(Topic, related_name='posts', on_delete=models.RESTRICT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True)
    created_by = models.ForeignKey(User, related_name='posts', on_delete=models.RESTRICT)
    updated_by = models.ForeignKey(User, null=True, related_name='+', on_delete=models.RESTRICT)


class Phones(models.Model):
    name = models.ForeignKey(User, related_name='pones', on_delete=models.RESTRICT)
    n_main = models.CharField(max_length=4, null=True, blank=True)
    n_second = models.CharField(max_length=4, null=True, blank=True)
    n_mobile = models.CharField(max_length=4, null=True, blank=True)
    n_out = models.CharField(max_length=11, null=True, blank=True)
    mobile1 = models.CharField(max_length=11, null=True, blank=True)
    mobile2 = models.CharField(max_length=11, null=True, blank=True)


class Ad(models.Model):
    ad = models.CharField(max_length=500)
    author = models.ForeignKey(UserProfile, related_name='ads', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


# ---------------------------------------------------------------------------------------------------------------------
# Counterparty
class Counterparty(models.Model):
    name = models.CharField(max_length=100)
    is_provider = models.BooleanField(default=True)  # True - постачальник, False - покупець
    legal_address = models.CharField(max_length=200, null=True)
    actual_address = models.CharField(max_length=200, null=True)
    product = models.ForeignKey(Product_type, related_name='counterparties', on_delete=models.RESTRICT)
    country = models.CharField(max_length=100, null=True)
    edrpou = models.CharField(max_length=8, null=True)
    bank_details = models.CharField(max_length=200, null=True)  # Реквізити
    contacts = models.CharField(max_length=200, null=True)
    added = models.DateField(auto_now_add=True)
    scope = models.ForeignKey(Scope, related_name='counterparties', on_delete=models.RESTRICT, null=True)
    responsible = models.ForeignKey(UserProfile, related_name='responsible', null=True, on_delete=models.RESTRICT)
    author = models.ForeignKey(UserProfile, related_name='providers_added', on_delete=models.RESTRICT)
    commentary = models.CharField(max_length=3000, null=True)
    is_active = models.BooleanField(default=True)


class Counterparty_certificate(models.Model):
    counterparty = models.ForeignKey(Counterparty, related_name='certificates', on_delete=models.RESTRICT)
    certification_type = models.ForeignKey(Certification_type, related_name='certificates', on_delete=models.RESTRICT)
    number = models.CharField(max_length=20)
    production_groups = models.CharField(max_length=100, null=True)
    declaration = models.CharField(max_length=100, null=True)
    start = models.DateField(null=True)
    end = models.DateField(null=True)
    old_plhk_number = models.CharField(max_length=10, null=True)
    is_active = models.BooleanField(default=True)


class Counterparty_certificate_pause(models.Model):
    certificate = models.ForeignKey(Counterparty_certificate, related_name='pauses', on_delete=models.RESTRICT)
    pause_start = models.DateField(null=True)
    pause_end = models.DateField(null=True)
    is_active = models.BooleanField(default=True)


# ---------------------------------------------------------------------------------------------------------------------
# Non Compliances
class Non_compliance(models.Model):
    author = models.ForeignKey(UserProfile, related_name='non_compliances_added', on_delete=models.RESTRICT)
    phase = models.PositiveSmallIntegerField()  # 0 - creating, 1 - chief, 2 - visas, 3 - director, 4 - execution, 5 - done
    department = models.ForeignKey(Department, related_name='non_compliances', on_delete=models.RESTRICT)
    dep_chief = models.ForeignKey(UserProfile, related_name='dep_non_compliances', on_delete=models.RESTRICT)
    dep_chief_approved = models.BooleanField(null=True)
    date_added = models.DateField(auto_now_add=True)
    name = models.CharField(max_length=100)
    product = models.ForeignKey(Product_type, related_name='non_compliances', on_delete=models.RESTRICT)
    party_number = models.CharField(max_length=10)
    order_number = models.CharField(max_length=10)
    manufacture_date = models.DateField()
    total_quantity = models.CharField(max_length=5)
    nc_quantity = models.CharField(max_length=5)
    packing_type = models.CharField(max_length=15)
    provider = models.ForeignKey(Counterparty, related_name='non_compliances', on_delete=models.RESTRICT)
    reason = models.CharField(max_length=300)
    status = models.CharField(max_length=100)
    classification = models.CharField(max_length=100)
    defect = models.CharField(max_length=100)
    analysis_results = models.CharField(max_length=100)
    sector = models.CharField(max_length=100)

    final_decision = models.CharField(max_length=100, null=True)
    final_decision_time = models.DateTimeField(null=True)
    responsible = models.ForeignKey(UserProfile, related_name='non_compliances_responsible', on_delete=models.RESTRICT, null=True)

    corrective_action = models.CharField(max_length=100, null=True)
    corrective_action_number = models.CharField(max_length=10, null=True)
    retreatment_date = models.DateField(null=True)
    spent_time = models.CharField(max_length=5, null=True)
    people_involved = models.CharField(max_length=3, null=True)
    quantity_updated = models.CharField(max_length=10, null=True)
    status_updated = models.CharField(max_length=50, null=True)
    return_date = models.DateField(null=True)
    is_active = models.BooleanField(default=True)


class Non_compliance_file(models.Model):
    file = models.FileField(upload_to='boards/non_compliances/%Y/%m')
    name = models.CharField(max_length=100)
    non_compliance = models.ForeignKey(Non_compliance, related_name='files', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Non_compliance_comment(models.Model):
    non_compliance = models.ForeignKey(Non_compliance, related_name='comments', on_delete=models.RESTRICT)
    author = models.ForeignKey(UserProfile, related_name='non_compliance_comments', on_delete=models.RESTRICT)
    comment = models.CharField(max_length=1000, null=True)
    original_comment = models.ForeignKey('self', related_name='answers', null=True, on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Non_compliance_comment_file(models.Model):
    file = models.FileField(upload_to='boards/non_compliances/%Y/%m')
    name = models.CharField(max_length=100)
    comment = models.ForeignKey(Non_compliance_comment, related_name='comment_files', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Non_compliance_decision(models.Model):
    non_compliance = models.ForeignKey(Non_compliance, related_name='decisions', on_delete=models.RESTRICT)
    user = models.ForeignKey(UserProfile, related_name='non_compliance_decisions', on_delete=models.RESTRICT)
    decision = models.CharField(max_length=50, null=True)
    decision_time = models.DateTimeField(null=True)
    phase = models.SmallIntegerField(default=1)
    is_active = models.BooleanField(default=True)


# ---------------------------------------------------------------------------------------------------------------------
# Reclamations
class Reclamation(models.Model):
    author = models.ForeignKey(UserProfile, related_name='reclamations_added', on_delete=models.RESTRICT)
    phase = models.PositiveSmallIntegerField()  # 0 - creating, 1 - chief, 2 - visas, 3 - director, 4 - execution, 5 - done
    department = models.ForeignKey(Department, related_name='reclamations', on_delete=models.RESTRICT)
    dep_chief = models.ForeignKey(UserProfile, related_name='dep_reclamations', on_delete=models.RESTRICT)
    dep_chief_approved = models.BooleanField(null=True)
    product = models.ForeignKey(Product, related_name='reclamations', on_delete=models.RESTRICT)
    client = models.ForeignKey(Counterparty, related_name='reclamations', on_delete=models.RESTRICT)
    reason = models.CharField(max_length=300)
    car_number = models.CharField(max_length=10)
    date_manufacture = models.DateField()
    date_shipment = models.DateField()
    date_received = models.DateField(auto_now_add=True)
    date_db_added = models.DateField(auto_now_add=True)
    final_decision = models.CharField(max_length=500, null=True)
    final_decision_time = models.DateTimeField(null=True)
    responsible = models.ForeignKey(UserProfile, related_name='reclamations_responsible', on_delete=models.RESTRICT, null=True)
    answer_responsible_dep = models.ForeignKey(Department, related_name='reclamations_responsible', on_delete=models.RESTRICT, null=True)
    is_active = models.BooleanField(default=True)


class Reclamation_file(models.Model):
    file = models.FileField(upload_to='boards/reclamations/%Y/%m')
    name = models.CharField(max_length=100)
    reclamation = models.ForeignKey(Reclamation, related_name='files', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Reclamation_comment(models.Model):
    reclamation = models.ForeignKey(Reclamation, related_name='comments', on_delete=models.RESTRICT)
    author = models.ForeignKey(UserProfile, related_name='reclamations_comments', on_delete=models.RESTRICT)
    comment = models.CharField(max_length=1000, null=True)
    original_comment = models.ForeignKey('self', related_name='answers', null=True, on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Reclamation_comment_file(models.Model):
    file = models.FileField(upload_to='boards/reclamations/%Y/%m')
    name = models.CharField(max_length=100)
    comment = models.ForeignKey(Reclamation_comment, related_name='comment_files', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)


class Reclamation_decision(models.Model):
    reclamation = models.ForeignKey(Reclamation, related_name='decisions', on_delete=models.RESTRICT)
    user = models.ForeignKey(UserProfile, related_name='reclamations_decisions', on_delete=models.RESTRICT)
    decision = models.CharField(max_length=500, null=True)
    decision_time = models.DateTimeField(null=True)
    phase = models.SmallIntegerField(default=1)
    is_active = models.BooleanField(default=True)


# ----------------------------------- Letters
class Letter(models.Model):
    counterparty = models.ForeignKey(Counterparty, related_name='letters', on_delete=models.RESTRICT)
    name = models.CharField(max_length=100)
    text = models.CharField(max_length=1000)
    date = models.DateField(null=True, blank=True, default=timezone.now)
    counterparty_mail = models.CharField(max_length=50)
    comment = models.CharField(max_length=1000, null=True)
    is_active = models.BooleanField(default=True)


class Letter_File(models.Model):
    file = models.FileField(upload_to='counterparties/letters/%Y/%m')
    name = models.CharField(max_length=100)
    letter = models.ForeignKey(Letter, related_name='files', on_delete=models.RESTRICT)
    is_active = models.BooleanField(default=True)
