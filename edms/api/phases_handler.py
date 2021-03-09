from django.core.exceptions import ValidationError
from plxk.api.try_except import try_except
from edms.forms import NewApprovalForm, ApprovedApprovalForm
from edms.models import Doc_Type_Phase, Doc_Type_Phase_Queue, Doc_Approval, Employee_Seat
from edms.api.setters import post_mark_demand, new_mail
from edms.api.getters import get_zero_phase_id, get_chief_emp_seat, get_phase_recipient_list, \
    get_my_seats, get_phase_id_sole_recipients
from edms.api.approvals_handler import is_approval_module_used, is_approvals_used, post_auto_approve, \
    add_zero_phase_auto_approvals, is_in_approval_list
from edms.api.vacations import vacation_check


@try_except
def handle_phase_approvals(doc_request, phase_info):
    approvals_emp_seat = Doc_Approval.objects.values('id', 'emp_seat_id', 'approve_queue') \
        .filter(document_id=doc_request['document']) \
        .filter(approve_queue=phase_info['phase'])\
        .exclude(approved=True) \
        .filter(is_active=True)

    # Якщо у даній фазі нема жодного отримувача, переходимо на наступну:
    if not any(approval['approve_queue'] == phase_info['phase'] for approval in approvals_emp_seat):
        auto_recipients = get_phase_recipient_list(phase_info['id'])
        if not auto_recipients:
            new_phase(doc_request, phase_info['phase'] + 1, [])
    else:
        for approval in approvals_emp_seat:
            # Відправляємо на погодження тільки тим отримувачам, черга яких відповідає даній фазі
            if approval['approve_queue'] == phase_info['phase']:
                post_mark_demand(doc_request, approval['emp_seat_id'], phase_info['id'], phase_info['mark_id'])
                new_mail('new', [{'id': approval['emp_seat_id']}], doc_request)


# Функція, яка додає у бд список отримуючих на візування
def post_approval_list(doc_request, approvals):
    for recipient in approvals:
        # Якщо отримувач уже є в автоматичному списку отримувачів, не додаємо його
        if not is_in_approval_list(recipient['id'], doc_request['document']):
            doc_request.update({'emp_seat': recipient['id']})
            doc_request.update({'approve_queue': recipient['approve_queue']})
            doc_request.update({'approved': None})
            doc_request.update({'approve_path': None})

            if recipient['id'] == doc_request['employee_seat']:
                doc_request.update({'approved': True})
                doc_request.update({'approve_path': doc_request['document_path']})
                approval_form = ApprovedApprovalForm(doc_request)
            else:
                approval_form = NewApprovalForm(doc_request)

            if approval_form.is_valid():
                new_approval = approval_form.save()

            else:
                raise ValidationError('edms/views post_approval_list approval_form invalid')


# Визначає, чи існує користувач у автоматичному списку погоджуючих
def is_in_doc_phase_queue(recipient, doc_type):
    phase_queue_by_emp_seat_exists = Doc_Type_Phase_Queue.objects \
        .filter(phase__document_type=doc_type) \
        .filter(employee_seat_id=recipient['id'])\
        .exists()
    if phase_queue_by_emp_seat_exists:
        return True

    recipient_seat = Employee_Seat.objects.values_list('seat', flat=True).filter(id=recipient['id'])[0]
    phase_queue_by_seat_exists = Doc_Type_Phase_Queue.objects \
        .filter(phase__document_type=doc_type) \
        .filter(seat_id=recipient_seat)\
        .exists()

    return phase_queue_by_seat_exists


# Створення mark_demand для отримувачів, що позначені у списку на ознайомлення
def handle_phase_acquaints(doc_request, recipients):
    for recipient in recipients:
        if recipient['type'] == 'acquaint':
            zero_phase_id = get_zero_phase_id(doc_request['document_type'])
            recipient_acquaint = vacation_check(recipient['id'])
            post_mark_demand(doc_request, recipient_acquaint, zero_phase_id, 8)
            new_mail('new', [{'id': recipient_acquaint}], doc_request)


# Створення mark_demand для отримувачів, що позначені у списку на підпис
def handle_phase_signs(doc_request, phase_info, sign_list):
    for sign in sign_list:
        sign = vacation_check(sign['emp_seat'])
        # Відправляємо на погодження тільки тим отримувачам, черга яких відповідає даній фазі
        post_mark_demand(doc_request, sign, phase_info['id'], 2)  # 2 - Погодження
        new_mail('new', [{'id': sign}], doc_request)


# Створення mark_demand для отримувачів, визначених автором
def handle_phase_recipients(doc_request, phase_info, recipients):
    for recipient in recipients:
        # Якщо отримувач - хтось із ланки шефів, треба пустити документ на "Не заперечую" усім шефам:
        if recipient['type'] == 'chief':
            if phase_info['mark_id'] == 2:

                # Витягуємо ід кінцевого отримувача та ід безпосереднього керівника автора:
                recipient_chief = recipient['id']
                direct_chief = get_chief_emp_seat(doc_request['employee_seat'])

                # Якщо керівник автора є кінцевим отримувачем:
                if direct_chief:
                    # Позначка 6 "Не заперечую" для безпос. керівника, якщо той не є отримувачем документу.
                    mark = phase_info['mark_id'] if recipient_chief == direct_chief['emp_seat_id'] else 6
                    recipient = vacation_check(direct_chief['emp_seat_id'])
                    post_mark_demand(doc_request, recipient, phase_info['id'], mark)
                    new_mail('new', [{'id': recipient}], doc_request)
                else:
                    test = 1  # TODO повернення помилки про відсутність безпосереднього керівника
        # Якщо отримувач - sign, то фаза повинна вимагати позначку 2:
        elif recipient['type'] == 'sign' and phase_info['mark_id'] == 2:
            recipient = vacation_check(recipient['id'])
            post_mark_demand(doc_request, recipient, phase_info['id'], phase_info['mark_id'])
            new_mail('new', [{'id': recipient}], doc_request)


# Створення mark_demand для отримувачів, визначених автоматично
def handle_phase_marks(doc_request, phase_info):
    # "Не заперечую":
    if phase_info['mark_id'] == 6:
        # Посада безпосереднього керівника:
        direct_chief = get_chief_emp_seat(doc_request['employee_seat'])

        if direct_chief:  # Можливо, ніхто не займає цю посаду
            # Якщо безпосередній керівник позначений як отримувач наступної фази,
            # то переходимо на наступну фазу одразу:

            # Знаходимо усі посади начальника (можливо він в.о. директора)
            direct_chief_seats = get_my_seats(direct_chief['emp_id'])

            next_phases = Doc_Type_Phase.objects.values('id', 'mark_id') \
                .filter(document_type_id=doc_request['document_type']).filter(phase=phase_info['phase'] + 1)
            mark = phase_info['mark_id']
            phase_id = phase_info['id']

            for next_phase in next_phases:
                next_phase_recipients = get_phase_recipient_list(next_phase['id'])
                for direct_chief_seat in direct_chief_seats:
                    if direct_chief_seat['id'] in next_phase_recipients:
                        direct_chief['emp_seat_id'] = direct_chief_seat['id']
                        mark = next_phase['mark_id']
                        phase_id = next_phase['id']
            post_mark_demand(doc_request, direct_chief['emp_seat_id'], phase_id, mark)
            new_mail('new', [{'id': direct_chief['emp_seat_id']}], doc_request)
        else:
            test = 1  # TODO повернення помилки про відсутність безпосереднього керівника

    # Погоджую
    elif phase_info['mark_id'] == 2:
        # Якщо позначка "Погоджую":
        # Шукаємо, яка посада має ставити цю позначку у doc_type_phase_queue
        # recipients = get_phase_recipient_list(phase_info['id'])
        recipients = get_phase_id_sole_recipients(phase_info['id'], doc_request['employee_seat'])
        for recipient in recipients:
            recipient = vacation_check(recipient)
            post_mark_demand(doc_request, recipient, phase_info['id'], phase_info['mark_id'])
            new_mail('new', [{'id': recipient}], doc_request)

    # Прикріплення підписаних скан-копій Договора, Підтвердження виконання заявки
    elif phase_info['mark_id'] in [22, 24]:
        recipient = vacation_check(doc_request['doc_author_id'])
        new_mail('new', [{'id': recipient}], doc_request)
        post_mark_demand(doc_request, recipient, phase_info['id'], phase_info['mark_id'])

    # Якщо користувач не обирає самостійно візуючих, але такі є обрані автоматично:
    elif not is_approval_module_used(doc_request['document_type']) and phase_info['mark_id'] == 17:
        recipients = get_phase_recipient_list(phase_info['id'])
        for recipient in recipients:
            recipient = vacation_check(recipient)
            post_mark_demand(doc_request, recipient, phase_info['id'], phase_info['mark_id'])
            new_mail('new', [{'id': recipient}], doc_request)

    else:
        # Визначаємо усіх отримувачів для кожної позначки:
        recipients = get_phase_recipient_list(phase_info['id'])
        for recipient in recipients:
            recipient = vacation_check(recipient)
            new_mail('new', [{'id': recipient}], doc_request)
            post_mark_demand(doc_request, recipient, phase_info['id'], phase_info['mark_id'])


def new_phase(doc_request, phase_number, modules_recipients=None):
    # Знаходимо id's фази.
    # Тут може бути декілька самих ід фаз. Тобто, документ може йти відразу декільком отримувачам.
    if modules_recipients is None:
        modules_recipients = []
    phases = Doc_Type_Phase.objects.values('id', 'phase', 'mark_id', 'is_approve_chained') \
        .filter(document_type_id=doc_request['document_type']).filter(phase=phase_number).filter(is_active=True)

    # 0. Спочатку відправляємо документ на ознайомлення, для цього використовується фаза 0,
    # бо ознайомлення фактично не є фазою і не впливає на шлях документа
    handle_phase_acquaints(doc_request, modules_recipients)

    if phases:
        for phase_info in phases:
            # 1. Створюємо таблицю візування для новоствореного документа:
            if phase_number == 1 and doc_request['mark'] == 1:
                if is_approvals_used(doc_request['document_type']):
                    add_zero_phase_auto_approvals(doc_request, phase_info)

            if phase_info['mark_id'] == 20:
                # автоматичне заповнення полей approved, approved_date
                post_auto_approve(doc_request)
                new_phase(doc_request, phase_number+1)

            elif phase_info['mark_id'] in [22, 24]:
                # додавання засканованих підписаних документів, Підтвердження виконання заявки
                handle_phase_marks(doc_request, phase_info)
            else:
                # 3. Опрацьовуємо документ, якщо є список візуючих (автоматичний чи обраний):
                if is_approvals_used(doc_request['document_type']):
                    handle_phase_approvals(doc_request, phase_info)
                else:
                    # 4. Для автоматичного вибору отримувача визначаємо, яка позначка використовується у даній фазі:
                    handle_phase_marks(doc_request, phase_info)
                # 5. Перебираємо modules_recipients в пошуках отримувачів, яких визначено при створенні документа:
                handle_phase_recipients(doc_request, phase_info, modules_recipients)
