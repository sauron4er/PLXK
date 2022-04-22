from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from plxk.api.try_except import try_except
from django.http import Http404, HttpResponse
import json
from edms.models import Seat
from edms.forms import SeatInstructionForm


@login_required(login_url='login')
@try_except
def org_structure(request):
    return render(request, 'hr/org_structure_old/index.html')


@login_required(login_url='login')
@try_except
def get_seat_info(request, pk):
    seat = get_object_or_404(Seat, pk=pk)
    seat_info = {
        'seat': seat.seat,
        'old_file': seat.instructions_file.name,
        'is_dep_chief': seat.is_dep_chief
    }
    return HttpResponse(json.dumps(seat_info))


@login_required(login_url='login')
@try_except
def post_instruction(request):
    seat = get_object_or_404(Seat, pk=request.POST['seat_id'])
    form = SeatInstructionForm(request.POST, request.FILES, instance=seat)
    if form.is_valid():
        # seat.instructions_file =
        form.save()
    return HttpResponse()
