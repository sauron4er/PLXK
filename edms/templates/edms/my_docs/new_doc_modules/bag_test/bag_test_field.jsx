'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from '../new_doc_store';
import ModuleWrap from 'edms/templates/edms/my_docs/new_doc_modules/module_wrap';

function BagTestField(props) {
  function onChange(e) {
    newDocStore.new_document.bag_test_fields[props.name] = e.target.value;
  }

  return (
    <ModuleWrap columns={props.columns}>
      <small>{props.label}</small>
      <input
        className='form-control'
        type={props.type}
        name={props.name}
        id={props.name}
        value={newDocStore.new_document.bag_test_fields[props.name]}
        onChange={onChange}
        maxLength={props.length}
        readOnly={props.read_only}
      />
    </ModuleWrap>
  );
}

BagTestField.defaultProps = {
  name: '',
  label: '',
  length: 0,
  columns: 4,
  type: 'text',
  read_only: false
};

export default view(BagTestField);
