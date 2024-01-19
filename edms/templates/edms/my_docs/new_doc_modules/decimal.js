'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import { getIndexByProperty } from "templates/components/my_extras";
import newDocStore from "edms/templates/edms/my_docs/new_doc_modules/new_doc_store";

function Integer(props) {
  function onDecimalChange(e) {
    console.log(1);
    const regex = /^\d+\.\d{0,2}$/;
    // TODO доробити регекс, щоб пропускав лише 3 цифри до крапки і дві після.
    console.log(regex.test(e.target.value))
    newDocStore.new_document.decimal = e.target.value
  }

  return (
    <>
      <div>{props.module_info.field_name}</div>
      <input
        className='form-control'
        name='decimal'
        type='number'
        step='.01'
        id={'decimal' + props.module_info.queue}
        value={newDocStore.new_document.decimal}
        onChange={onDecimalChange}
        maxLength={5}
      />
    </>
  );
}

Integer.defaultProps = {
  module_info: {
    field_name: '---',
    queue: 0,
    required: false,
    additional_info: null
  }
};

export default view(Integer);
