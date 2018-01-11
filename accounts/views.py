from django.contrib.auth import login as auth_login
from django.contrib.auth.models import User
from django.shortcuts import render, redirect,get_object_or_404
from .models import Department

from .forms import SignUpForm

def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user)
            return redirect('forum')
    else:
        form = SignUpForm()
    return render(request, 'accounts/signup.html', {'form': form})

def departments(request):
    departments = Department.objects.all()
    return render(request, 'accounts/departments.html', {'depatments':departments})

def department(request,pk):
    department = get_object_or_404(Department,pk = pk)
    employee = User.objects.filter(userprofile__department_id=pk).order_by('userprofile__pip')
    return render(request, 'accounts/department.html', {'depatment':department,'employee':employee})