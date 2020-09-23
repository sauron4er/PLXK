from django.contrib.auth.models import User
from django.shortcuts import render, get_object_or_404, redirect
from django.http import Http404, HttpResponse
from .models import Board, Phones, Topic, Post, Ad
from .forms import NewTopicForm, NewAdForm
from django.db import connections
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from datetime import date
from django.utils import timezone
import pytz
import json
import random
from edms.models import Employee_Seat


def org_structure(request):
    return render(request, 'boards/org_structure/org_structure.html')
