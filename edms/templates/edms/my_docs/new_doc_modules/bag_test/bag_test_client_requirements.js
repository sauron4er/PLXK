'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';
import BagTestField from 'edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test_field';
import BagTestFile from 'edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test_file';
import ModuleWrap from 'edms/templates/edms/my_docs/new_doc_modules/module_wrap';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selectors/selector_with_filter_and_axios';
import { axiosGetRequest } from "templates/components/axios_requests";
import { notify } from "templates/components/my_extras";
import useSetState from "templates/hooks/useSetState";
import { LoaderMini } from "templates/components/loaders";

function BagTestClientRequirements(props) {
  const [state, setState] = useSetState({
    bag_name: '',
    weight_kg: '',
    mf_water: '',
    mf_ash: '',
    mf_evaporable: '',
    mf_not_evaporable_carbon: '',
    main_faction: '',
    granulation_lt5: '',
    granulation_lt10: '',
    granulation_lt20: '',
    granulation_lt25: '',
    granulation_lt40: '',
    granulation_mt_20: '',
    granulation_mt_60: '',
    granulation_mt_80: '',
    loading: true
  })

  function onAddManualCRChange(e) {
    newDocStore.new_document.bag_test_fields.add_manual_CR = !newDocStore.new_document.bag_test_fields.add_manual_CR;
    newDocStore.new_document.bag_test_fields.client_requirements = 0;
    newDocStore.new_document.bag_test_fields.client_requirements_name = '';
  }

  function onClientRequirementsChange(e) {
    newDocStore.new_document.bag_test_fields.client_requirements = e.id;
    newDocStore.new_document.bag_test_fields.client_requirements_name = e.name;
    getCRdata(e.id)
  }

  function getCRdata(cr_id) {
    axiosGetRequest(`get_cr/${cr_id}'`)
      .then((response) => {
        this.setState({
          state: response,
          loading: false
        });
      })
      .catch((error) => notify(error));

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
              <If condition={newDocStore.new_document.bag_test_fields.client_requirements}>
                <Choose>
                  <When condition={!state.loading}>
                    123
                  </When>
                  <Otherwise>
                    <LoaderMini/>
                  </Otherwise>
                </Choose>
              </If>
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
