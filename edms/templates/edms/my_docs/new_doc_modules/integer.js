'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import { getIndexByProperty } from "templates/components/my_extras";
import newDocStore from "edms/templates/edms/my_docs/new_doc_modules/new_doc_store";

function Integer(props) {
  function onIntegerChange(e) {
    newDocStore.new_document.integer = e.target.value
  }

  return (
    <>
      <div>{props.module_info.field_name}</div>
      <input
        className='form-control'
        name='integer'
        type='text'
        id={'integer' + props.module_info.queue}
        value={newDocStore.new_document.integer}
        onChange={onIntegerChange}
        maxLength={9} // so there will be no possibility to save more than django's max for integer
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
