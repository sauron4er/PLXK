from django.shortcuts import render
from django.db import connections
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

def index(request):
    cursor = connections['fb1'].cursor()
    text_sql = 'select  vn.name as vaga, count(v.Key) as ct from vaga v inner join vaga_name vn on v.vaga_name = vn."KEY" where v.state=3 and v.d > current_date -7    group by 1'
    cursor.execute(text_sql)
    vaga = cursor.fetchall()

    text_sql2 = 'select  r.name as raw, count(v.Key) as ct  from vaga v inner join raw r on v.raw = r."KEY" where v.state=3 and v.d > current_date -30    group by 1  order by 2 desc'
    cursor.execute(text_sql2)
    raw = cursor.fetchall()

    text_sql2 = 'select *    from WOOD_IN_D'
    cursor.execute(text_sql2)
    wood1= cursor.fetchall()

    return render(request, 'crm/index.html',{'vaga':vaga,'raw':raw, 'wood':wood1})

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

