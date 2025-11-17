import smtplib
from my_config import mail_host, mail_sender, mail_login, mail_pass


def send_email(mail, body):
    if mail != '':
    # if 1 == 2:
        try:
            server = smtplib.SMTP(mail_host, timeout=2000)
            server.login(mail_login, mail_pass)
            server.sendmail(mail_sender, [mail], body)
            server.quit()
        except OSError as err:
            print(err)
            # TODO gmail заблокував цю можливість без використання двохфакторної авт.
            # TODO треба повертати користувачу помилку про те, що лежить поштовий сервер і нема змоги відправити листи
            # Якщо внутрішня пошта it@lxk.com.ua лежить, відправляємо з gmail:
            # sender = "edms.lxk@gmail.com"
            # server = smtplib.SMTP('smtp.gmail.com:587', timeout=2000)
            # server.ehlo()
            # server.starttls()
            # server.login('edms.lxk', '[svpfdjlgjinf]')
            # server.sendmail(sender, [mail], body)
            # server.sendmail(sender, 'sauron4er@gmail.com', body)
            # server.sendmail(sender, 'it@lxk.com.ua', body)
            # server.quit()
        except Exception as err:
            print(err)


def send_test_mail():
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    message = MIMEMultipart("alternative")
    message["Subject"] = "Тестовий лист"
    message["From"] = 'it@lxk.com.ua'
    message["To"] = 'sauron4er@gmail.com'
    text = 'Текст тестового повідомлення'

    message.attach(MIMEText(text, "plain"))

    send_email('sauron4er@gmail.com', message.as_string())