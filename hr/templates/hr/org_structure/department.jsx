import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import Seat from 'hr/templates/hr/org_structure/seat';
import Modal from 'react-responsive-modal';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import 'css/org_structure.css';
import SeatList from 'hr/templates/hr/org_structure/seat_list';
import DepRegulation from 'hr/templates/hr/org_structure/dep_regulation';

function Department(props) {
  const [state, setState] = useSetState({
    modal_opened: false,
    opened_seat_id: 0,
    opened_seat: '',
    instruction_files: [],
    employees: [],
    loading: true
  });

  function openModal(seat) {
    setState({
      opened_seat_id: seat.id,
      opened_seat: seat.name,
      modal_opened: true
    });
    getSeat(seat);
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

  function closeModal(type) {
    setState({modal_opened: false});
  }

  return (
    <>
      <DepRegulation files={props.dep.regulation_files} />
      <SeatList seats={props.dep.seats} onSeatClick={openModal} />
      <Modal
        open={state.modal_opened}
        onClose={closeModal}
        showCloseIcon={true}
        closeOnOverlayClick={true}
        styles={{modal: {marginTop: 100, width: '700px'}}}
      >
        <Seat seat_name={state.opened_seat} loading={state.loading} files={state.instruction_files} employees={state.employees} />
      </Modal>
    </>
  );
}

export default Department;
