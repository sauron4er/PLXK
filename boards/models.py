from django.db import models
from django.contrib.auth.models import User
from accounts.models import UserProfile, Department
from production.models import Product_type, Certification_type, Scope


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


class Non_compliance(models.Model):
    author = models.ForeignKey(UserProfile, related_name='non_compliances_added', on_delete=models.RESTRICT)
    phase = models.PositiveSmallIntegerField()  # 0 - creating, 1 - chief, 2 - visas, 3 - director, 4 - execution, 5 - done
    department = models.ForeignKey(Department, related_name='non_compliances', on_delete=models.RESTRICT)
    dep_chief = models.ForeignKey(UserProfile, related_name='dep_non_compliances', on_delete=models.RESTRICT)
    dep_chief_approved = models.BooleanField()
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
    reason = models.CharField(max_length=1000)
    status = models.CharField(max_length=100)
    classification = models.CharField(max_length=100)
    defect = models.CharField(max_length=100)
    analysis_results = models.CharField(max_length=100)
    sector = models.CharField(max_length=100)

    final_decision = models.CharField(max_length=100, null=True)
    decision_date = models.DateField(null=True)
    result_of_nc = models.CharField(max_length=100, null=True)
    corrective_action = models.CharField(max_length=100, null=True)
    corrective_action_number = models.CharField(max_length=10, null=True)
    other = models.CharField(max_length=100, null=True)
    retreatment_date = models.DateField(null=True)
    spent_time = models.CharField(max_length=100, null=True)
    people_involved = models.CharField(max_length=3, null=True)
    quantity_updated = models.CharField(max_length=10, null=True)
    status_updated = models.CharField(max_length=50, null=True)
    is_active = models.BooleanField(default=True)
