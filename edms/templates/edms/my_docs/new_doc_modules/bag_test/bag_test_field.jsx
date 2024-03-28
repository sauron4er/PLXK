'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from '../new_doc_store';

function BagTestField(props) {
  function onChange(e) {
    newDocStore.new_document.bag_test_fields[props.name] = e.target.value;
  }

    return (
      <div className='col-md-4'>
        {/*<div className='css_edms_client_requirement'>*/}
        {/*  <label htmlFor={name}>*/}
        {/*    <small><If condition={!notRequired}>* </If>{label}</small>*/}
        {/*  </label>*/}
        {/*  <input*/}
        {/*    className='form-control'*/}
        {/*    name={name}*/}
        {/*    id={name}*/}
        {/*    value={client_requirements[name]}*/}
        {/*    onChange={this.onChange}*/}
        {/*    maxLength={10}*/}
        {/*  />*/}
        {/*</div>*/}
      </div>
    );
}

BagTestField.defaultProps = {
  name: '',
  label: '',
};

export default view(BagTestField);
