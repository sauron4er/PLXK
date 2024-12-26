import smtplib
from my_config import mail_host, mail_pass


def send_email_hostiq(mail, body):  # from Hostiq
    if mail != '':
    # if 1 == 2:
        sender = "it@lxk.com.ua"
        try:
            server = smtplib.SMTP_SSL(mail_host, timeout=2000)
            server.login(sender, mail_pass)
            server.sendmail(sender, [mail], body)
            # server.sendmail(sender, 'sauron4er@gmail.com', body)
            # server.sendmail(sender, 'it@lxk.com.ua', body)
            server.quit()
        except OSError as err:
            print(err)
        except Exception as err:
            print(err)


def send_email(mail, body):
    if mail != '':
    # if 1 == 2:
        sender = "it@lxk.com.ua"
        host = "10.20.10.20"
        try:
            server = smtplib.SMTP(host, timeout=2000)
            server.login('it_lxk.com.ua', mail_pass)

            server.sendmail(sender, [mail], body)
            # server.sendmail(sender, 'sauron4er@gmail.com', body)

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
