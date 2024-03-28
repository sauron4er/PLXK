'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';
import BagTestField from "edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test_field";

function BagTest(props) {
  function onChange(e) {

  }

  return (
    <div className='row'>
      <BagTestField name='length' label='Довжина, см;' />
    </div>
  );
}

BagTest.defaultProps = {};

export default view(BagTest);
