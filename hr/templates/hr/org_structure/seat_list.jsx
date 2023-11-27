import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import 'css/org_structure.css';
import Seat from 'hr/templates/hr/org_structure/seat';
import SubmitButton from "templates/components/form_modules/submit_button";

function SeatList(props) {
  const [state, setState] = useSetState({
    modal_opened: false
  });

  function openModal() {
    setState({modal_opened: true});
  }

  function closeModal() {
    setState({modal_opened: false});
  }

  return (
    <>
      <div className='font-weight-bold'>Посади:</div>
      <For each='seat' of={props.seats} index='seat_idx'>
        <div key={seat.id} onClick={(e) => props.onSeatClick(seat)}>
          <Choose>
            <When condition={seat.id}>
              <div className='css_os_seat'>
                <span className={seat.is_chief ? 'font-weight-bold' : null} key={1}>
                  {seat.name}
                </span>
                <span key={2} className='css_os_seat_arrow'>
                  >
                </span>
              </div>
            </When>
            <Otherwise>
              <div className='font-weight-bold'>{seat.name}</div>
            </Otherwise>
          </Choose>
        </div>
      </For>
      <SubmitButton className='btn-outline-primary ml-2' onClick={(e) => props.onSeatAddClick()} text='Додати посаду' />
    </>
  );
}

SeatList.defaultProps = {
  seats: [],
  onSeatClick: () => {}
};

export default SeatList;
