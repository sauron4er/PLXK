import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import Seat from 'hr/templates/hr/org_structure/seat';
import Modal from 'react-responsive-modal';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import 'css/org_structure.css';
import SeatList from 'hr/templates/hr/org_structure/seat_list';
import DepRegulation from 'hr/templates/hr/org_structure/dep_regulation';
import DepWorkInstructions from 'hr/templates/hr/org_structure/dep_work_instructions';
import TextInput from 'templates/components/form_modules/text_input';
import SubmitButton from 'templates/components/form_modules/submit_button';
import NewSeat from "hr/templates/hr/org_structure/new_seat";

function Department(props) {
  const [state, setState] = useSetState({
    modal_opened: false,
    opened_seat: 0,
    opened_seat_name: '',
    instruction_files: [],
    employees: [],
    dep_name: props.dep.name,
    loading: true
  });

  function openModal(seat) {
    setState({
      opened_seat: seat.id,
      opened_seat_name: seat.name,
      modal_opened: true,
      instruction_files: [],
      employees: [],
      loading: true
    });
    getSeat(seat);
  }

  function openModalAddSeat(seat) {
    setState({
      opened_seat: 0,
      opened_seat_name: '',
      modal_opened: true,
      instruction_files: [],
      employees: [],
      loading: false
    });
  }

  function getSeat(seat) {
    axiosGetRequest(`get_seat/${seat.id}`)
      .then((response) => {
        setState({
          instruction_files: response.instruction_files,
          employees: response.employees,
          loading: false
        });
      })
      .catch((error) => notify(error));
  }

  function closeModal() {
    setState({modal_opened: false});
  }

  function onDepNameChange(e) {
    setState({dep_name: e.target.value});
  }

  function onDepNameSave(e) {
    let formData = new FormData();
    formData.append('new_name', state.dep_name);

    axiosPostRequest(`dep_name_change/${props.dep.id}`, formData)
      .then((response) => {
        location.reload();
      })
      .catch((error) => notify(error));
  }

  return (
    <>
      <If condition={window.edit_enabled}>
        <div className='d-flex'>
          <div className='flex-grow-1'>
            <TextInput text={state.dep_name} fieldName={'Редагувати назву'} onChange={onDepNameChange} maxLength={200} disabled={false} />
          </div>
          <SubmitButton className='btn-outline-primary ml-2' onClick={() => onDepNameSave()} text='save_icon' disabled={state.dep_name.length < 3} />
        </div>
      </If>
      <DepRegulation files={props.dep.regulation_files} />
      <SeatList seats={props.dep.seats} onSeatClick={openModal} onSeatAddClick={openModalAddSeat} />
      <DepWorkInstructions files={props.dep.work_instructions_files} />
      <Modal
        open={state.modal_opened}
        onClose={closeModal}
        showCloseIcon={true}
        closeOnOverlayClick={true}
        styles={{modal: {marginTop: 100, width: '700px'}}}
      >
        <Choose>
          <When condition={state.opened_seat_name}>
            <Seat seat_name={state.opened_seat_name} loading={state.loading} files={state.instruction_files} employees={state.employees} />
          </When>
          <Otherwise>
            <NewSeat department={props.dep.id}/>
          </Otherwise>
        </Choose>
        </Modal>
    </>
  );
}

export default Department;
