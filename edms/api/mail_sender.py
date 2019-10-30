import smtplib


# Складаємо лист новому отримувачу документа
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


# Складаємо лист автору документа про нову позначку:
def send_email_mark(doc_request, mail):
    subject = "Нова реакція на Ваш електронний документ"
    link = 'Щоб переглянути, перейдіть за посиланням: http://10.10.10.22/edms/my_docs/{}'\
        .format(doc_request['document'])
    text = '{} відреагував "{}" на Ваш документ № {} ({}). {}' \
        .format(doc_request['mark_author_name'], doc_request['mark_name'],
                doc_request['document'], doc_request['doc_type_name'], link)

    body = u"\r\n".join((
        "From: it@lxk.com.ua",
        "To: " + mail,
        "Subject: " + subject,
        "",
        text
    )).encode('cp1251').strip()

    send_email(mail, body)


# Відправляємо лист:
def send_email(mail, body):
    sender = "it@lxk.com.ua"
    host = "imap.polyprom.com"
    try:
        server = smtplib.SMTP(host, timeout=2000)
        server.login('lxk_it', 'J2NYEHb50nymRF1L')
        server.sendmail(sender, [mail], body)
        server.quit()
    except OSError as err:
        # Якщо внутрішня пошта it@lxk.com.ua лежить, відправляємо з gmail:
        sender = "edms.lxk@gmail.com"
        server = smtplib.SMTP('smtp.gmail.com:587', timeout=2000)
        server.ehlo()
        server.starttls()
        server.login('edms.lxk', 'J2NYEHb50nymRF1L')
        server.sendmail(sender, [mail], body)
        server.quit()