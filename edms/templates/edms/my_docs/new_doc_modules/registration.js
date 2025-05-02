'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';

function Registration(props) {
  function onChange(e) {
    newDocStore.new_document.registration_number = e.target.value;
  }

  return (
    <>
      <div className='mt-1'>{props.moduleInfo.field_name}:</div>
      <div className='d-flex align-items-center mt-1'>
        <input
          className='form-control mr-1'
          name='registration'
          id='registration'
          value={newDocStore.new_document.registration_number}
          onChange={onChange}
          maxLength={50}
        />
      </div>
      <If condition={props.moduleInfo.additional_info}>
        <small className='text-danger'>{props.moduleInfo.additional_info}</small>
      </If>
    </>
  );
}

Registration.defaultProps = {
  moduleInfo: {
    fieldName: '',
    additional_info: ''
  }
};

export default view(Registration);
