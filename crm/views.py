from django.shortcuts import render
from django.db import connections
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

def index(request):

    return render(request, 'crm/index.html')

def employee(request,pk):
    cursor = connections['fb1'].cursor()
    text_sql = """ SELECT   e.KEY as id, p.ip1, p.ip, e.name, d.name as department,  e.phone,  e.pk_name, e.pk_user,  p.domain_name  
                  FROM     EMPLOYEE  e left join pc p on e.pc = p.id left join department d on e.department = d."KEY" where e.Tech>0 and e.act>0 Order by %s """ % pk

    cursor.execute(text_sql)

    if request.user.userprofile.is_it_admin:
        employees = cursor.fetchall()
    else:
        employees = ""

    paginator = Paginator(employees,2500)
    page = request.GET.get('page')
    try:
        employees = paginator.page(page)
    except PageNotAnInteger:
        employees = paginator.page(1)
    except EmptyPage:
        employees = paginator.page(paginator.num_pages)

    return render(request,'crm/employee.html',{'employees': employees,'e':request.user.userprofile.is_it_admin})

