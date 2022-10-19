'use strict';
import React from 'react';

function EmployeeSeat(props) {
  return (
    <>
      {props.fieldName}:
      <div className='css_note_text'>
        {props.emp_seat.name}, {props.emp_seat.seat}
      </div>
    </>
  );
}

EmployeeSeat.defaultProps = {
  emp_seat: {},
  fieldName: 'Кому:'
};

export default EmployeeSeat;
