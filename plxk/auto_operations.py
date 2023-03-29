from datetime import datetime


def do_stuff():
    now = datetime.now()
    current_hour = now.strftime("%H")
    print(current_hour == '06')
