import json
from plxk.api.try_except import try_except
from plxk.api.datetime_normalizers import date_to_json
from boards.models import Letter, Letter_File


@try_except
def get_letters_list(counterparty_id):
    letters_query = Letter.objects\
        .prefetch_related('files')\
        .filter(counterparty__id=counterparty_id)\
        .filter(is_active=True)\
        .order_by('name')

    letters = [{
        'id': letter.pk,
        'name': letter.name,
        'text': letter.text,
        'date': date_to_json(letter.date),
        'counterparty_mail': letter.counterparty_mail,
        'comment': letter.comment,
        'files': [{
            'id': file.id,
            'file': file.file.name,
            'name': file.name,
            'status': 'old'
        } for file in letter.files.filter(is_active=True)],
    } for letter in letters_query]

    return letters


@try_except
def add_or_change_letter(request):
    letter = json.loads(request.POST['letter'])
    try:
        letter_instance = Letter.objects.get(id=letter['id'])
    except Letter.DoesNotExist:
        letter_instance = Letter(counterparty_id=request.POST['counterparty_id'])
    letter_instance.name = letter['name']
    letter_instance.text = letter['text']
    letter_instance.date = letter['date']
    letter_instance.counterparty_mail = letter['counterparty_mail']
    letter_instance.comment = letter['comment']
    letter_instance.save()

    handle_files(request, letter_instance)
    return letter_instance.id


@try_except
def handle_files(request, letter_instance):
    new_files = request.FILES.getlist('new_files')

    for file in new_files:
        Letter_File.objects.create(
            letter=letter_instance,
            file=file,
            name=file.name
        )

    old_files = json.loads(request.POST['old_files'])
    for file in old_files:
        if file['status'] == 'delete':
            file_instance = Letter_File.objects.get(id=file['id'])
            file_instance.is_active = False
            file_instance.save()


@try_except
def deactivate_letter(id):
    ct_instance = Letter.objects.get(id=id)
    ct_instance.is_active = False
    ct_instance.save()
    return 'ok'
