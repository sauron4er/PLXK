'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from '../new_doc_store';

function BagTestField(props) {
  function onChange(e) {
    newDocStore.new_document.bag_test_fields[props.name] = e.target.value;
  }

    return (
      <div className={`col-md-${props.columns}`}>
        <div className='css_edms_client_requirement'>
          <small>{props.label}</small>
          <input
            className='form-control'
            name={props.name}
            id={props.name}
            value={newDocStore.new_document.bag_test_fields[props.name]}
            onChange={onChange}
            maxLength={props.length}
          />
        </div>
      </div>
    );
}

BagTestField.defaultProps = {
  name: '',
  label: '',
  length: 0,
  columns: 4
};

export default view(BagTestField);
