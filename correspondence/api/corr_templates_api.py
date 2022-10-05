import json
from plxk.api.try_except import try_except
from correspondence.models import Corr_Template, Corr_Template_File


@try_except
def get_corr_templates():
    corr_templates_query = Corr_Template.objects\
        .prefetch_related('files')\
        .filter(is_active=True)\
        .order_by('name')

    corr_templates = [{
        'id': template.pk,
        'name': template.name,
        'files': [{
            'id': file.id,
            'file': file.file.name,
            'name': file.name,
            'status': 'old'
        } for file in template.files.filter(is_active=True)]
    } for template in corr_templates_query]

    return corr_templates


@try_except
def add_or_change_corr_template(request):
    corr_template = json.loads(request.POST['corr_template'])
    try:
        ct_instance = Corr_Template.objects.get(id=corr_template['id'])
        ct_instance.name = corr_template['name']
    except Corr_Template.DoesNotExist:
        ct_instance = Corr_Template(name=corr_template['name'])
    ct_instance.save()

    handle_files(request, ct_instance)
    return ct_instance.id


@try_except
def handle_files(request, ct_instance):
    new_files = request.FILES.getlist('new_files')

    for file in new_files:
        Corr_Template_File.objects.create(
            corr_template=ct_instance,
            file=file,
            name=file.name
        )

    old_files = json.loads(request.POST['old_files'])
    for file in old_files:
        if file['status'] == 'delete':
            file_instance = Corr_Template_File.objects.get(id=file['id'])
            file_instance.is_active = False
            file_instance.save()


@try_except
def deactivate_corr_template(id):
    ct_instance = Corr_Template.objects.get(id=id)
    ct_instance.is_active = False
    ct_instance.save()
    return 'ok'
