import smtplib


def send_email(mail, body):
    if mail != '':
        sender = "it@lxk.com.ua"
        host = "imap.polyprom.com"
        try:
            server = smtplib.SMTP(host, timeout=2000)
            server.login('lxk_it', 'J2NYEHb50nymRF1L')
            server.sendmail(sender, [mail], body)
            # server.sendmail(sender, 'sauron4er@gmail.com', body)
            # server.sendmail(sender, 'it@lxk.com.ua', body)
            server.quit()
        except OSError as err:
            print(err)
            # Якщо внутрішня пошта it@lxk.com.ua лежить, відправляємо з gmail:
            sender = "edms.lxk@gmail.com"
            server = smtplib.SMTP('smtp.gmail.com:587', timeout=2000)
            server.ehlo()
            server.starttls()
            server.login('edms.lxk', 'J2NYEHb50nymRF1L')
            server.sendmail(sender, [mail], body)
            # server.sendmail(sender, 'sauron4er@gmail.com', body)
            # server.sendmail(sender, 'it@lxk.com.ua', body)
            server.quit()
