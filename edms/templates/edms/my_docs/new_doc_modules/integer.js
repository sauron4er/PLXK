'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import {getIndexByProperty} from 'templates/components/my_extras';
import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';

function Integer(props) {
  function onIntegerChange(e) {
    const regex = /^\d*$/;
    if (regex.test(e.target.value)) newDocStore.new_document.integer = e.target.value;
  }

  return (
    <label className='full_width' htmlFor={'integer' + props.module_info.queue}>
      <If condition={props.module_info.required}>{'* '}</If> {props.module_info.field_name}:
      <input
        className='form-control'
        name='integer'
        type='text'
        id={'integer' + props.module_info.queue}
        value={newDocStore.new_document.integer}
        onChange={onIntegerChange}
        maxLength={9} // so there will be no possibility to save more than django's max for integer
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
