'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';
import SignedCR from 'edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test_cr/signed_cr';
import ManualCR from 'edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test_cr/manual_cr';

function BagTestClientRequirements(props) {
  function onAddManualCRChange(e) {
    newDocStore.new_document.bag_test_fields.add_manual_CR = !newDocStore.new_document.bag_test_fields.add_manual_CR;
    newDocStore.new_document.bag_test_fields.client_requirements = 0;
    newDocStore.new_document.bag_test_fields.client_requirements_name = '';
  }

  return (
    <>
      <small>*Вимоги клієнта</small>
      <Choose>
        <When condition={newDocStore.new_document.bag_test_fields.client}>
          <div className='form-group form-check'>
            <input type='checkbox' className='form-check-input' id='add_manual_CR' onChange={onAddManualCRChange} />
            <label className='form-check-label' htmlFor='add_manual_CR'>
              <small>Додати вимоги клієнта вручну</small>
            </label>
          </div>
          <Choose>
            <When condition={newDocStore.new_document.bag_test_fields.add_manual_CR}>
              <ManualCR />
            </When>
            <Otherwise>
              <SignedCR />
            </Otherwise>
          </Choose>
        </When>
        <Otherwise>
          <div className=''>Оберіть клієнта</div>
        </Otherwise>
      </Choose>
    </>
  );
}

BagTestClientRequirements.defaultProps = {};

export default view(BagTestClientRequirements);
