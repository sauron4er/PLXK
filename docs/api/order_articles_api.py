from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from datetime import date
from copy import deepcopy
import calendar
import json
from plxk.api.try_except import try_except
from docs.forms import NewArticleForm, DeactivateArticleForm, ArticleDoneForm, \
    NewResponsibleForm, DeactivateResponsibleForm
from docs.models import Order_article, Article_responsible, Responsible_file


@try_except
def post_articles(post_request):
    articles = json.loads(post_request['articles'])
    for article in articles:
        if article['status'] == 'new':
            add_article(article, post_request)
        elif article['status'] == 'change':
            change_article(article, post_request)
        elif article['status'] == 'delete':
            delete_article(article['id'], post_request)
        # Якщо status == 'old' - не робимо нічого


@try_except
def add_article(article, post_request):
    post_request.update({
        'text': article['text'],
        'deadline': article['deadline'],
        'order': post_request['id'],
        'periodicity': article['periodicity']
    })

    new_article_form = NewArticleForm(post_request)
    if new_article_form.is_valid():
        new_article_id = new_article_form.save().pk
    else:
        raise ValidationError('docs/orders_articles_api/add_article: new_article_form invalid')

    post_request.update({'article': new_article_id})

    for responsible in article['responsibles']:
        add_responsible(responsible, post_request)

    post_article_done(post_request, new_article_id)


@try_except
def change_article(article, post_request):
    post_request.update({
        'text': article['text'],
        'deadline': None if article['constant'] == 'true' else article['deadline'],
        'article': article['id'],
        'periodicity': article['periodicity']
    })

    for responsible in article['responsibles']:
        if responsible['status'] == 'new':
            add_responsible(responsible, post_request)
        elif responsible['status'] == 'change':
            change_responsible(responsible, post_request)
        elif responsible['status'] == 'delete':
            delete_responsible(responsible['responsible_id'], post_request)

    article_instance = get_object_or_404(Order_article, pk=article['id'])
    article_form = NewArticleForm(post_request, instance=article_instance)
    if article_form.is_valid():
        article_form.save()
    else:
        raise ValidationError('docs/orders_articles_api/change_article: article_form invalid')

    article_done = post_article_done(post_request, article['id'])
    if article_done:
        if article['periodicity'] == 'm':
            clone_monthly_article(article_instance)
        elif article['periodicity'] == 'y':
            clone_yearly_article(article_instance)


@try_except
def delete_article(article_id, post_request):
    post_request.update({'is_active': False})
    article_instance = get_object_or_404(Order_article, pk=article_id)

    delete_article_form = DeactivateArticleForm(post_request, instance=article_instance)
    if delete_article_form.is_valid():
        delete_article_form.save()
    else:
        raise ValidationError('docs/orders_articles_api: function delete_article: delete_article_form invalid')


@try_except
def post_article_done(post_request, article_id):
    article = get_object_or_404(Order_article, pk=article_id)
    done = not Article_responsible.objects.filter(article_id=article_id).filter(done=False).filter(is_active=True).exists()

    if done != article.done:
        post_request.update({'done': done})
        article_done_form = ArticleDoneForm(post_request, instance=article)
        if article_done_form.is_valid():
            article_done_form.save()
        else:
            raise ValidationError('docs/orders_articles_api/post_article_done: article_done_form invalid')
    return done


@try_except
def clone_monthly_article(article):
    if article.first_instance:
        first_deadline = article.first_instance.deadline
    else:
        first_deadline = article.deadline

    if article.deadline.month == 12:
        new_year = article.deadline.year + 1
        new_month = 1
    else:
        new_year = article.deadline.year
        new_month = article.deadline.month + 1

    if first_deadline.day > 28:
       num_of_days_in_new_month = calendar.monthrange(new_year, new_month)[1]
       if num_of_days_in_new_month < first_deadline.day:
           new_day = num_of_days_in_new_month
       else:
           new_day = first_deadline.day
    else:
        new_day = first_deadline.day

    new_deadline = date(new_year, new_month, new_day)

    # Зберігаємо новий пункт:
    new_article = deepcopy(article)
    new_article.deadline = new_deadline
    new_article.first_instance_id = article.pk
    new_article.pk = None
    new_article.save()

    # TODO скопіювати всіх відповідальних з попереднього article

    a = 1
    # TODO додати перевірку на те, чи буде ще дійсний сам наказ через місяць, якщо ні, то не створювати клон.


@try_except
def clone_yearly_article(article):
    a=1


@try_except
def add_responsible(responsible, post_request):
    post_request.update({
        'employee_seat': responsible['id'],
        'comment': None,
        'done': responsible['done']
    })

    new_responsible_form = NewResponsibleForm(post_request)
    if new_responsible_form.is_valid():
        new_responsible_form.save()
    else:
        raise ValidationError('docs/orders_articles_api: function add_responsible: new_responsible_form invalid')


@try_except
def change_responsible(responsible, post_request):
    post_request.update({
        'employee_seat': responsible['id'],
        'comment': responsible['comment'] if responsible['comment'] != '' else None,
        'done': responsible['done']
    })

    responsible_instance = get_object_or_404(Article_responsible, pk=responsible['responsible_id'])

    responsible_form = NewResponsibleForm(post_request, instance=responsible_instance)
    if responsible_form.is_valid():
        responsible_form.save()
    else:
        raise ValidationError('docs/orders_articles_api: function change_responsible: responsible_form invalid')

    delete_responsible_files(responsible_instance, responsible['files_old'])


@try_except
def delete_responsible(responsible_id, post_request):
    post_request.update({'is_active': False})
    responsible_instance = get_object_or_404(Article_responsible, pk=responsible_id)

    delete_responsible_form = DeactivateResponsibleForm(post_request, instance=responsible_instance)
    if delete_responsible_form.is_valid():
        delete_responsible_form.save()
    else:
        raise ValidationError('docs/orders_articles_api: function delete_responsible: delete_responsible_form invalid')


@try_except
def post_responsible_files(request):
    responsible_inst = get_object_or_404(Article_responsible, pk=request.POST['responsible_id'])
    for file in request.FILES.getlist('files'):
        Responsible_file.objects.create(
            responsible=responsible_inst,
            file=file,
            name=file.name
        )


@try_except
def delete_responsible_files(responsible_inst, files_old):
    for file in files_old:
        if file['status'] == 'delete':
            Responsible_file.objects.filter(id=file['id']).update(is_active=False)
