from django.core.exceptions import ValidationError


def try_except(func):
    def func_wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValidationError as e:
            print(e)
            raise ValidationError(e)
        except Exception as e:
            print('!!! error !!!')
            print(func.__name__ + ': ')
            print(e)
            print('-------------')
            raise Exception(e)
    return func_wrapper
