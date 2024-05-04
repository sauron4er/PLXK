import json
from datetime import datetime
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError, ObjectDoesNotExist

from plxk.api.try_except import try_except
from ..models import File, Document_Path, Doc_Type_Phase_Queue, Doc_Counterparty, Doc_Registration, \
    Doc_Sub_Product, Doc_Scope, Doc_Law, Client_Requirements, Client_Requirement_Additional, Doc_Doc_Link, \
    Doc_Foyer_Range, Doc_Employee, Cost_Rates, Cost_Rates_Rate, Cost_Rates_Additional, \
    Doc_Contract_Subject, Doc_Deadline, Doc_Recipient, Decree_Article, Decree_Article_Responsible, \
    Doc_Integer, Doc_Decimal, Bag_Test, Bag_Test_File, Doc_Boolean, Doc_Seat
from ..forms import NewTextForm, NewRecipientForm, NewAcquaintForm, NewDayForm, NewGateForm, CarryOutItemsForm, \
    FileNewPathForm, NewMockupTypeForm, NewMockupProductTypeForm, NewDocContractForm, Employee_Seat
from .vacations import vacation_check
from edms.api.getters import get_zero_phase_id, get_dep_chief_id, get_chief_id, get_actual_emp_seat_from_seat
from edms.api.setters import post_mark_demand, new_mail
from edms.api.phases_handler import post_approval_list


@try_except
def post_text(doc_request, text_list):
    for text in text_list:
        if 'queue' in text.keys():
            doc_request.update({'queue_in_doc': text['queue']})
            doc_request.update({'text': text['text']})
            text_form = NewTextForm(doc_request)
            if text_form.is_valid():
                text_form.save()
            else:
                raise ValidationError('post_modules/post_text/text_form invalid')


@try_except
def post_booleans(doc_id, booleans):
    for boolean in booleans:
        new_boolean = Doc_Boolean(document_id=doc_id)
        new_boolean.queue_in_doc = boolean['queue']
        new_boolean.checked = boolean['checked']
        new_boolean.save()


@try_except
def post_seat(doc_id, seat_id):
    new_doc_seat = Doc_Seat(document_id=doc_id, seat_id=seat_id)
    new_doc_seat.save()


@try_except
def post_integer(document_id, integer):
    new_doc_integer = Doc_Integer(document_id=document_id)
    new_doc_integer.integer = integer['value']
    new_doc_integer.queue_in_doc = integer['queue']
    new_doc_integer.save()


@try_except
def post_decimal(document_id, decimal):
    new_doc_decimal = Doc_Decimal(document_id=document_id)
    new_doc_decimal.decimal = decimal['value']
    new_doc_decimal.queue_in_doc = decimal['queue']
    new_doc_decimal.save()


@try_except
def post_recipient_chief(doc_request, recipient_chief):
    # Отримувач-шеф отримує mark-demand з вимогою поставити "Погоджую"
    chief_emp_seat_id = vacation_check(recipient_chief)
    doc_request.update({'recipient': chief_emp_seat_id})

    recipient_form = NewRecipientForm(doc_request)
    if recipient_form.is_valid():
        recipient_form.save()
    else:
        raise ValidationError('post_modules/post_recipient_chief/recipient_form invalid')


@try_except
def post_acquaint_list(doc_request, acquaint_list):  # отримуючі на ознайомлення
    for recipient in acquaint_list:
        emp_seat_id = vacation_check(recipient['id'])
        doc_request.update({'acquaint_emp_seat': emp_seat_id})

        acquaint_form = NewAcquaintForm(doc_request)
        if acquaint_form.is_valid():
            acquaint_form.save()
        else:
            raise ValidationError('post_modules/post_acquaint_list/acquaint_form invalid')


@try_except
def post_days(doc_request, days):
    for day in days:
        doc_request.update({'queue_in_doc': day['queue']})
        doc_request.update({'day': day['day']})
        day_form = NewDayForm(doc_request)
        day_form.save()


@try_except
def post_foyer_ranges(doc_request, datetimes):
    for fdt in datetimes:
        new_fdt = Doc_Foyer_Range(document_id=doc_request['document'])
        # new_fdt.out_datetime = datetime.strptime(fdt['out'], "%Y-%m-%dT%H:%M:%S.%fz")
        # new_fdt.in_datetime = datetime.strptime(fdt['in'], "%Y-%m-%dT%H:%M:%S.%fz")
        if fdt['out'] != '':
            new_fdt.out_datetime = datetime.fromtimestamp(fdt['out'])
        if fdt['in'] != '':
            new_fdt.in_datetime = datetime.fromtimestamp(fdt['in'])
        new_fdt.save()


@try_except
def handle_approvals_from_template(approvals):
    # Обробляє список візуючих, отриманий з шаблону, замінює дані з emp_seat_id в id
    for approval in approvals:
        if 'emp_seat_id' in approval:
            approval['id'] = approval['emp_seat_id']
    return approvals


@try_except
def post_approvals(doc_request, approvals, company, contract_subject_approvals):
    # 1. Обробляємо список візуючих, отриманий з шаблону
    approvals = handle_approvals_from_template(approvals)

    # 2. Додаємо у список doc_approval_list
    for approval in contract_subject_approvals:
        approvals.append({
            'id': approval['emp_seat_id'],
            'approve_queue': 1
        })

    # Додаємо у список погоджуючих автора, керівника відділу та директорів
    auto_approval_seats = Doc_Type_Phase_Queue.objects \
        .filter(phase__document_type=doc_request['document_type']) \
        .filter(is_active=True) \
        .exclude(phase__mark_id__in=[27, 33])

    if doc_request['doc_type_version'] != '0':
        # doc_type_version = Document_Type_Version.objects.values_list('id', flat=True)\
        #     .filter(document_type_id=doc_request['document_type'])\
        #     .filter(version_id=doc_request['doc_type_version'])\
        #     .filter(is_active=True)
        # doc_type_version = doc_type_version[0]
        auto_approval_seats = auto_approval_seats.filter(doc_type_version=doc_request['doc_type_version'])

    auto_approval_seats = [{
        'id': item.seat.id,
        'approve_queue': item.phase.phase,
        'doc_type_version': item.doc_type_version
    } for item in auto_approval_seats]

    auto_approvals = []
    for seat in auto_approval_seats:
        employee_seat_id = get_actual_emp_seat_from_seat(seat['id'])
        auto_approvals.append({
            'id': employee_seat_id,
            'approve_queue': seat['approve_queue']
        })

    approvals = approvals + auto_approvals

    # Видаляємо автора зі списку і додаємо, щоб він там був лише раз:
    approvals[:] = [i for i in approvals if not (int(i['id']) == int(doc_request['employee_seat']))]

    approvals.append({
        'id': doc_request['employee_seat'],
        'approve_queue': 0  # Автор документа перший у списку погоджень
    })

    # Видаляємо директорів зі списку і додаємо, щоб вони там були лише раз:
    director = Employee_Seat.objects.values_list('id', flat=True) \
        .filter(seat_id=16) \
        .filter(is_active=True) \
        .filter(is_main=True)[0]

    acting_director = vacation_check(director)

    tov_director = Employee_Seat.objects.values_list('id', flat=True) \
        .filter(seat_id=247) \
        .filter(is_active=True)[0]

    acting_tov_director = vacation_check(tov_director)

    tov_tech_director = Employee_Seat.objects.values_list('id', flat=True) \
        .filter(seat_id=285) \
        .filter(is_active=True)[0]

    acting_tov_tech_director = vacation_check(tov_tech_director)

    if doc_request['document_type'] in [17, 19]:  # Тендери
        # Директор ТОВ отримує на погодження усі тендери
        approvals[:] = [i for i in approvals if not (int(i['id']) == tov_director or int(i['id']) == acting_tov_director)]
        approvals.extend([{
            'id': acting_tov_director,
            'approve_queue': 3
        },
        {
            'id': acting_tov_tech_director,
            'approve_queue': 2
        }])

        # Директор ТДВ отримує на погодження лише тендери по ТДВ
        if doc_request['doc_type_version'] == '1':  # ТДВ
            approvals[:] = [i for i in approvals if not (int(i['id']) == director or int(i['id']) == acting_director)]
            approvals.extend([{
                'id': acting_director,
                'approve_queue': 3
            }])

    elif doc_request['document_type'] in [20, 22, 23]:  # Договори
        if company == 'ТДВ':
            approvals[:] = [i for i in approvals if not (int(i['id']) == director or int(i['id']) == acting_director)]
            approvals[:] = [i for i in approvals if not (int(i['id']) == tov_director or int(i['id']) == acting_tov_director)]
            approvals[:] = [i for i in approvals if not (int(i['id']) == tov_director or int(i['id']) == acting_tov_tech_director)]

            approvals.extend([{
                'id': acting_director,
                'approve_queue': 1  # Директор останній у списку погоджень
                # 'approve_queue': 4  # Директор останній у списку погоджень
            }, {
                'id': acting_tov_director,
                'approve_queue': 1  # Директор ТОВ теж отримує на погодження
                # 'approve_queue': 3  # Директор ТОВ теж отримує на погодження
            }, {
                'id': acting_tov_tech_director,
                'approve_queue': 1  # Технічний директор ТОВ теж отримує на погодження
            }])
        else:
            zero_phase_id = get_zero_phase_id(doc_request['document_type'])
            post_mark_demand(doc_request, acting_director, zero_phase_id, 8)
            new_mail('new', [{'id': acting_director}], doc_request)

            approvals[:] = [i for i in approvals if not (int(i['id']) == tov_director or int(i['id']) == acting_tov_director)]
            approvals.extend([{
                'id': acting_tov_director,
                'approve_queue': 1  # Директор останній у списку погоджень
                # approve_queue: 3, якщо директор погоджує останній, а не з усіма разом
            },
            {
                'id': acting_tov_tech_director,
                'approve_queue': 1  # Технічний директор теж отримує на погодження
                # 'approve_queue': 2  # Технічний директор теж отримує на погодження
            }
            ])
    else:  # Накази
        if company == 'ТДВ':
            approvals[:] = [i for i in approvals if not (int(i['id']) == director or int(i['id']) == acting_director)]

            approvals.extend([{
                'id': acting_director,
                'approve_queue': 2  # Директор останній у списку погоджень
            }])
        else:
            approvals[:] = [i for i in approvals if
                            not (int(i['id']) == tov_director or int(i['id']) == acting_tov_director)]
            approvals.extend([{
                'id': acting_tov_director,
                'approve_queue': 2  # Директор останній у списку погоджень
            }])

    # Видаляємо керівника відділу зі списку і додаємо, щоб він там був лише раз (якщо це не директор):
    chief = get_dep_chief_id(doc_request['employee_seat'])
    # якщо у відділа нема керівника, призначаємо безпос. керівника автора:
    if chief is None:
        chief = get_chief_id(doc_request['employee_seat'])

    if chief is None:
        raise ObjectDoesNotExist('У автора нема безпосереднього начальника')
    elif chief != int(doc_request['employee_seat']) and chief != director:
        approvals[:] = [i for i in approvals if not (int(i['id']) == chief)]

        approvals.append({
            'id': chief,
            'approve_queue': 1  # Керівник відділу другий у списку погоджень
        })
    post_approval_list(doc_request, approvals)


@try_except
def post_gate(doc_request, gate):
    doc_request.update({'gate': gate})
    gate_form = NewGateForm(doc_request)
    if gate_form.is_valid():
        gate_form.save()
    else:
        raise ValidationError('post_modules/post_gate/gate_form invalid')


@try_except
def post_carry_out_items(doc_request, carry_out_items):
    for item in carry_out_items:
        doc_request.update({'item_name': item['item_name']})
        doc_request.update({'quantity': item['quantity']})
        doc_request.update({'measurement': item['measurement']})
        carry_out_item_form = CarryOutItemsForm(doc_request)
        if carry_out_item_form.is_valid():
            carry_out_item_form.save()
        else:
            raise ValidationError('post_modules/post_carry_out_item/carry_out_item_form invalid')


@try_except
def post_files(doc_request, files, new_path):
    # Додаємо файли зі старого варіанта файла:
    if 'old_files' in doc_request.keys():
        old_files = json.loads(doc_request['old_files'])
        if old_files:
            for old_file in old_files:
                file = get_object_or_404(File, pk=old_file['id'])
                file_change_path_form = FileNewPathForm(doc_request, instance=file)
                if file_change_path_form.is_valid():
                    file_change_path_form.save()
                else:
                    raise ValidationError('post_modules/post_files/file_change_path_form invalid')

    # Додаємо нові файли:
    if files:
        # Поки що файли додаються тільки якщо документ публікується не як чернетка, тому що
        # для публікації файла необідно мати перший path_id документа, якого нема в чернетці
        if new_path is not None:
            doc_path = get_object_or_404(Document_Path, pk=new_path)
            # Якщо у doc_request нема "Mark" - це створення нового документу, потрібно внести True у first_path:
            first_path = doc_request['mark'] == 1

            for file in files:
                File.objects.create(
                    document_path=doc_path,
                    file=file,
                    name=file.name,
                    first_path=first_path
                )


@try_except
def post_mockup_type(doc_request, mockup_type):
    doc_request.update({'mockup_type': mockup_type})
    mockup_type_form = NewMockupTypeForm(doc_request)
    if mockup_type_form.is_valid():
        mockup_type_form.save()
    else:
        raise ValidationError('post_modules/post_mockup_type/mockup_type_form invalid')


@try_except
def post_mockup_product_type(doc_request, mockup_product_type):
    doc_request.update({'mockup_product_type': mockup_product_type})
    mockup_product_type_form = NewMockupProductTypeForm(doc_request)
    if mockup_product_type_form.is_valid():
        mockup_product_type_form.save()
    else:
        raise ValidationError('post_modules/post_mockup_product_type/mockup_product_type_form invalid')


@try_except
def post_counterparty(doc_request, counterparty, counterparty_input=''):
    # TODO прибрати counterparty_input взагалі з системи.
    doc_counterparty = Doc_Counterparty()
    doc_counterparty.document_id = doc_request['document']
    if counterparty != 0:
        doc_counterparty.counterparty_id = counterparty
    else:
        doc_counterparty.counterparty_input = counterparty_input
    doc_counterparty.save()


@try_except
def post_contract(doc_request, contract_id):
    if contract_id != 0:
        doc_request.update({'contract_id': contract_id})
        contract_form = NewDocContractForm(doc_request)
        if contract_form.is_valid():
            contract_form.save()
        else:
            raise ValidationError('post_modules/post_client/client_form invalid')


@try_except
def post_document_link(new_doc, document_id, module_id):
    if document_id != 0:
        new_doc_link = Doc_Doc_Link(document=new_doc, document_link_id=document_id, module_id=module_id)
        new_doc_link.save()


@try_except
def post_bag_test(new_doc, fields, files):
    new_bag_test = Bag_Test(document=new_doc)

    new_bag_test.provider_id = fields['provider']
    new_bag_test.client_id = fields['client']
    new_bag_test.test_type = fields['test_type']
    new_bag_test.bag_type = fields['bag_type']
    new_bag_test.length = fields['length']
    new_bag_test.width = fields['width']
    new_bag_test.depth = fields['depth']
    new_bag_test.density = fields['density']
    new_bag_test.weight = fields['weight']
    new_bag_test.material = fields['material']
    new_bag_test.layers = fields['layers']
    new_bag_test.color = fields['color']
    new_bag_test.deadline = fields['deadline']
    new_bag_test.samples_are_available = fields['samples_are_available']
    new_bag_test.author_comment = fields['author_comment']

    if fields['client_requirements']:
        new_bag_test.client_requirements_doc_id = fields['client_requirements']
    else:
        new_bag_test.bag_name = fields['cr_bag_name']
        new_bag_test.weight_kg = fields['cr_weight_kg']
        new_bag_test.mf_water = fields['cr_mf_water']
        new_bag_test.mf_ash = fields['cr_mf_ash']
        new_bag_test.mf_evaporable = fields['cr_mf_evaporable']
        new_bag_test.mf_not_evaporable_carbon = fields['cr_mf_not_evaporable_carbon']
        new_bag_test.main_faction = fields['cr_main_faction']
        new_bag_test.granulation_lt5 = fields['cr_granulation_lt5']
        new_bag_test.granulation_lt10 = fields['cr_granulation_lt10']
        new_bag_test.granulation_lt20 = fields['cr_granulation_lt20']
        new_bag_test.granulation_lt25 = fields['cr_granulation_lt25']
        new_bag_test.granulation_lt40 = fields['cr_granulation_lt40']
        new_bag_test.granulation_mt20 = fields['cr_granulation_mt20']
        new_bag_test.granulation_mt60 = fields['cr_granulation_mt60']
        new_bag_test.granulation_mt80 = fields['cr_granulation_mt80']
        
    new_bag_test.save()

    post_bag_test_files(new_bag_test.id, files)


@try_except
def post_bag_test_files(bag_test_id, files):
    if 'bt_tech_conditions_file' in files:
        Bag_Test_File.objects.create(
            bag_test_id=bag_test_id,
            field_name='tech_conditions_file',
            file=files.getlist('bt_tech_conditions_file')[0],
            name=files.getlist('bt_tech_conditions_file')[0].name
        )

    if 'sanitary_conclusion_tu_file' in files:
        Bag_Test_File.objects.create(
            bag_test_id=bag_test_id,
            field_name='sanitary_conclusion_tu_file',
            file=files.getlist('bt_sanitary_conclusion_tu_file')[0],
            name=files.getlist('bt_sanitary_conclusion_tu_file')[0].name
        )

    if 'bt_sanitary_conclusion_product_file' in files:
        Bag_Test_File.objects.create(
            bag_test_id=bag_test_id,
            field_name='sanitary_conclusion_product_file',
            file=files.getlist('bt_sanitary_conclusion_product_file')[0],
            name=files.getlist('bt_sanitary_conclusion_product_file')[0].name
        )

    if 'bt_quality_certificate_file' in files:
        Bag_Test_File.objects.create(
            bag_test_id=bag_test_id,
            field_name='quality_certificate_file',
            file=files.getlist('bt_quality_certificate_file')[0],
            name=files.getlist('bt_quality_certificate_file')[0].name
        )

    if 'bt_glue_certificate_file' in files:
        Bag_Test_File.objects.create(
            bag_test_id=bag_test_id,
            field_name='glue_certificate_file',
            file=files.getlist('bt_glue_certificate_file')[0],
            name=files.getlist('bt_glue_certificate_file')[0].name
        )

    if 'paint_certificate_file' in files:
        Bag_Test_File.objects.create(
            bag_test_id=bag_test_id,
            field_name='paint_certificate_file',
            file=files.getlist('bt_paint_certificate_file')[0],
            name=files.getlist('bt_paint_certificate_file')[0].name
        )

    if 'bt_material_certificate_file' in files:
        Bag_Test_File.objects.create(
            bag_test_id=bag_test_id,
            field_name='material_certificate_file',
            file=files.getlist('bt_material_certificate_file')[0],
            name=files.getlist('bt_material_certificate_file')[0].name
        )

    if 'bt_sample_design_file' in files:
        Bag_Test_File.objects.create(
            bag_test_id=bag_test_id,
            field_name='sample_design_file',
            file=files.getlist('bt_sample_design_file')[0],
            name=files.getlist('bt_sample_design_file')[0].name
        )


@try_except
def post_registration(new_doc, registration_number):
    if registration_number != '':
        new_doc_registration = Doc_Registration(document=new_doc, registration_number=registration_number)
        new_doc_registration.save()


@try_except
def change_registration_number(doc_id, registration_number):
    try:
        doc_registration_instance = Doc_Registration.objects.get(document_id=doc_id)
    except Doc_Registration.DoesNotExist:
        doc_registration_instance = Doc_Registration(document_id=doc_id)

    doc_registration_instance.registration_number = registration_number

    try:
        doc_registration_instance.save()
        return True
    except IntegrityError:
        return False


@try_except
def post_employee(new_doc, employee):
    new_employee = Doc_Employee(document=new_doc, queue_in_doc=employee['queue'], employee_id=employee['value'])
    new_employee.save()


@try_except
def post_company(new_doc, company):
    new_doc.company = company
    new_doc.save()


@try_except
def post_sub_product_type(new_doc, sub_product_type):
    doc_sub_product = Doc_Sub_Product(document=new_doc, sub_product_type_id=sub_product_type)
    doc_sub_product.save()


@try_except
def post_scope(new_doc, scope):
    doc_scope = Doc_Scope(document=new_doc, scope_id=scope)
    doc_scope.save()


@try_except
def post_law(new_doc, law):
    doc_law = Doc_Law(document=new_doc, law_id=law)
    doc_law.save()


@try_except
def post_contract_subject(new_doc, contract_subject):
    if 'id' in contract_subject and contract_subject['id'] != 0:
        new_contract_subject = Doc_Contract_Subject(document=new_doc, contract_subject_id=contract_subject['id'])
    else:
        new_contract_subject = Doc_Contract_Subject(document=new_doc, text=contract_subject['input'])

    new_contract_subject.save()


@try_except
def post_deadline(new_doc, deadline):
    if deadline:
        new_deadline = Doc_Deadline(document=new_doc, deadline=deadline)
        new_deadline.save()


@try_except
def post_employee_seat(new_doc, employee_seat):
    if employee_seat:
        new_doc_employee_seat = Doc_Recipient(document=new_doc, recipient_id=employee_seat)
        new_doc_employee_seat.save()


@try_except
def post_decree_articles(new_doc, decree_articles):
    if decree_articles:
        for article in decree_articles:
            post_article(new_doc.id, article)


@try_except
def change_decree_articles(document_id, decree_articles):
    for article in decree_articles:
        if 'id' in article:
            change_article(article)
        else:
            post_article(document_id, article)


@try_except
def change_client_requirements(document_id, new_cr_list, new_ar_list):
    client_requirements_instance = get_object_or_404(Client_Requirements, document_id=document_id)
    for cr in new_cr_list:
        if cr[0] not in ('document', 'type', 'is_active'):
            name = cr[0]
            value = cr[1]
            setattr(client_requirements_instance, name, value)
    client_requirements_instance.save()

    edit_additional_requirements(client_requirements_instance.id, new_ar_list)


@try_except
def edit_additional_requirements(cr_id, new_ar_list):
    for ar in new_ar_list:
        if ar['status'] == 'changed':
            ar_instance = get_object_or_404(Client_Requirement_Additional, id=ar['id'])
            ar_instance.name = ar['name']
            ar_instance.requirement = ar['requirement']
            ar_instance.save()
        elif ar['status'] == 'new':
            new_ar = Client_Requirement_Additional(client_requirements_id=cr_id, name=ar['name'], requirement=ar['requirement'])
            new_ar.save()
        elif ar['status'] == 'delete':
            ar_instance = get_object_or_404(Client_Requirement_Additional, id=ar['id'])
            ar_instance.is_active = False
            ar_instance.save()


@try_except
def change_article(article):
    article_instance = Decree_Article.objects.get(id=article['id'])

    if article['status'] == 'delete':
        article_instance.is_active = False
        article_instance.save()
    else:
        article_instance.text = article['text']
        article_instance.term = article['term']

        if article['term'] == 'term':
            article_instance.deadline = article['deadline']
            article_instance.periodicity = article['periodicity']

        article_instance.save()


@try_except
def post_article(doc_id, article):
    decree_article_instance = Decree_Article(document_id=doc_id,
                                             text=article['text'],
                                             term=article['term'])
    if article['term'] == 'term':
        decree_article_instance.deadline = article['deadline']
        decree_article_instance.periodicity = article['periodicity']
    decree_article_instance.save()
    post_decree_article_responsibles(decree_article_instance.id, article['responsibles'])


@try_except
def post_decree_article_responsibles(new_article_id, responsibles):
    for responsible in responsibles:
        new_resp = Decree_Article_Responsible(article_id=new_article_id, responsible_id=responsible['id'])
        new_resp.save()


@try_except
def post_client_requirements(new_doc, client_requirements):
    cr = Client_Requirements(document=new_doc)
    additional_requirements = client_requirements['additional_requirements']
    client_requirements.pop('document', None)
    client_requirements.pop('additional_requirements', None)

    for key in client_requirements:
        setattr(cr, key, client_requirements[key])
    cr.save()

    post_additional_requirement(cr, additional_requirements)


@try_except
def post_cost_rates(new_doc, cost_rates):
    cr = Cost_Rates(document=new_doc)

    cr.type = 'o' if cost_rates['type'] == 'Основні' else 't' if cost_rates['type'] == 'Тимчасові' else 'p'  # Планування
    cr.accounting = 'b' if cost_rates['accounting'] == 'Бухгалтерський' else 'u'  # Управлінський
    cr.product_type = 'n' if cost_rates['product_type'] == 'Напівфабрикати' else 'p'  # Готова продукція
    cr.product_id = cost_rates['product']
    if cost_rates['client'] != 0:
        cr.client_id = cost_rates['client']
    cr.date_start = cost_rates['date_start']
    cr.save()

    for field in cost_rates['fields']:
        if 'term' in field and 'norm' in field:
            cr_field = Cost_Rates_Rate(cost_rates=cr)
            cr_field.name_id = field['id']
            cr_field.term = field['term']
            cr_field.norm = field['norm']
            if 'comment' in field:
                cr_field.comment = field['comment']
            cr_field.save()

    for field in cost_rates['additional_fields']:
        add_field = Cost_Rates_Additional(cost_rates=cr)
        add_field.name = field['name']
        add_field.unit = field['unit']
        add_field.term = field['term']
        add_field.norm = field['norm']
        if 'comment' in field:
            add_field.comment = field['comment']
        add_field.save()


@try_except
def post_additional_requirement(cr, ars):
    for ar in ars:
        if ar['name'] != '':
            new_add_req = Client_Requirement_Additional(client_requirements=cr)
            new_add_req.name = ar['name']
            new_add_req.requirement = ar['requirement']
            new_add_req.save()
