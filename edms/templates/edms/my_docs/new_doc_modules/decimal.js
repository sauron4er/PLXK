'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import {getIndexByProperty} from 'templates/components/my_extras';
import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';

function Integer(props) {
  function onDecimalChange(e) {
    const regex = /^\d{0,3}(\.\d{0,2})?$/;
    if (regex.test(e.target.value)) newDocStore.new_document.decimal = e.target.value;
  }

  return (
    <label className='full_width' htmlFor={'decimal' + props.module_info.queue}>
      <If condition={props.module_info.required}>{'* '}</If> {props.module_info.field_name}:
      <input
        className='form-control'
        name='decimal'
        type='text'
        id={'decimal' + props.module_info.queue}
        value={newDocStore.new_document.decimal}
        onChange={onDecimalChange}
      />
    </label>
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
