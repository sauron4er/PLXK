'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';
import BagTestField from 'edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test_field';
import BagTestFile from 'edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test_file';
import ModuleWrap from 'edms/templates/edms/my_docs/new_doc_modules/module_wrap';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selectors/selector_with_filter_and_axios';

function BagTestClientRequirements(props) {

  function onAddManualCRChange(e) {
    newDocStore.new_document.bag_test_fields.add_manual_CR = !newDocStore.new_document.bag_test_fields.add_manual_CR;
  }

  function onClientRequirementsChange(e) {
    newDocStore.new_document.bag_test_fields.client_requirements = e.id;
    newDocStore.new_document.bag_test_fields.client_requirements_name = e.name;
  }

  return (
    <><small>Вимоги клієнта</small>
      <Choose>
        <When condition={newDocStore.new_document.bag_test_fields.client}>
          <div className="form-group form-check">
            <input type="checkbox" className="form-check-input" id="add_manual_CR" onChange={onAddManualCRChange} />
            <label className="form-check-label" htmlFor="add_manual_CR">
              <small>Додати вимоги клієнта вручну</small>
            </label>
          </div>
          <Choose>
            <When condition={newDocStore.new_document.bag_test_fields.add_manual_CR}>
              <div className="">Вимоги клієнта вручну</div>
            </When>
            <Otherwise>
              <SelectorWithFilterAndAxios
                listNameForUrl={`client_requirements_for_choose/${newDocStore.new_document.bag_test_fields.client}`}
                selectId="client_requirements"
                value={{
                  name: [newDocStore.new_document.bag_test_fields.client_requirements_name],
                  id: [newDocStore.new_document.bag_test_fields.client_requirements]
                }}
                onChange={onClientRequirementsChange}
                disabled={false}
              />
            </Otherwise>
          </Choose>
        </When>
        <Otherwise>
          <div className="">Оберіть клієнта</div>
        </Otherwise>
      </Choose></>
  );
}

BagTestClientRequirements.defaultProps = {};

export default view(BagTestClientRequirements);
