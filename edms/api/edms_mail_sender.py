from plxk.api.mail_sender import send_email


# Складаємо лист новому отримувачу документа EDMS
def send_email_new(doc_request, mail):
    subject = "Новий електронний документ"
    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/edms/my_docs/{}'\
        .format(doc_request['document'])
    text = 'Вашої реакції очікує новий документ ({}, автор: {}). {}'\
        .format(doc_request['doc_type_name'], doc_request['doc_author_name'], link)

    body = u"\r\n".join((
        "From: it@lxk.com.ua",
        "To: " + mail,
        "Subject: " + subject,
        "",
        text
    )).encode('cp1251').strip()

    send_email(mail, body)


# Складаємо лист автору документа про нову позначку EDMS:
def send_email_mark(doc_request, mail):
    subject = "Нова реакція на Ваш електронний документ"
    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/edms/my_docs/{}'\
        .format(doc_request['document'])
    text = 'Ваш документ #{} ({}) отримав позначку "{}". Автор позначки: {}. {}' \
        .format(doc_request['document'], doc_request['doc_type_name'],
                doc_request['mark_name'], doc_request['mark_author_name'], link)

    body = u"\r\n".join((
        "From: it@lxk.com.ua",
        "To: " + mail,
        "Subject: " + subject,
        "",
        text
    )).encode('cp1251').strip()

    send_email(mail, body)