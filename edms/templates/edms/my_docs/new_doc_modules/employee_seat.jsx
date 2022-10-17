'use strict';
import React, {useEffect} from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import SelectorWithFilterAndAxios from "templates/components/form_modules/selectors/selector_with_filter_and_axios";

function EmployeeSeat(props) {
  
  function onSelectChange(e) {
    newDocStore.new_document.emp_seat = e.id;
    newDocStore.new_document.emp_seat_name = e.name;
  }

  return (
    <div>
      <SelectorWithFilterAndAxios
        listNameForUrl='emp_seats'
        fieldName={`${props.module_info.required ? '* ' : ''}${props.module_info.field_name}`}
        selectId='emp_seat_select'
        onChange={onSelectChange}
        value={{name: newDocStore.new_document.emp_seat_name, id: newDocStore.new_document.emp_seat}}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.id}
        disabled={false}
      />
      <small className='text-danger'>{props.module_info?.additional_info}</small>
    </div>
  );
}

EmployeeSeat.defaultProps = {
  module_info: {
    field_name: '---',
    queue: 0,
    required: false,
    additional_info: null
  }
};

export default view(EmployeeSeat);
