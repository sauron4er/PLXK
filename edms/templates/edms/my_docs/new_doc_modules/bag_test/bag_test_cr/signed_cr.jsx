'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selectors/selector_with_filter_and_axios';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import useSetState from 'templates/hooks/useSetState';
import {LoaderMini} from 'templates/components/loaders';

function SignedCR() {
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
  });

  function onClientRequirementsChange(e) {
    newDocStore.new_document.bag_test_fields.client_requirements = e.id;
    newDocStore.new_document.bag_test_fields.client_requirements_name = e.name;
    getCRdata(e.id);
  }

  function getCRdata(cr_id) {
    axiosGetRequest(`get_cr/${cr_id}'`)
      .then((response) => {
        setState({
          ...response,
          loading: false
        });
      })
      .catch((error) => notify(error));
  }

  return (
    <>
      <SelectorWithFilterAndAxios
        listNameForUrl={`client_requirements_for_choose/${newDocStore.new_document.bag_test_fields.client}`}
        selectId='client_requirements'
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
            <div>Назва мішка, ТМ: {state.bag_name}</div>
            <div>Вага, кг: {state.weight_kg}</div>
            <div>Масова частка води, W,%: {state.mf_water}</div>
            <div>Масова частка золи в перерахунку на суху речовину, %: {state.mf_ash}</div>
            <div>Масова частка летких в перерахунку на суху речовину, %: {state.mf_evaporable}</div>
            <div>Масова частка нелеткого вуглецю в перерахунку на суху речовину, %: {state.mf_not_evaporable_carbon}</div>
            <div>Основна фракція: {state.main_faction}</div>
            <div>Грануляційний склад, фракція, &lt; 5 мм: {state.granulation_lt5}</div>
            <div>Грануляційний склад, фракція, &lt; 10 мм: {state.granulation_lt10}</div>
            <div>Грануляційний склад, фракція, &lt; 20 мм: {state.granulation_lt20}</div>
            <div>Грануляційний склад, фракція, &lt; 25 мм: {state.granulation_lt25}</div>
            <div>Грануляційний склад, фракція, &lt; 40 мм: {state.granulation_lt40}</div>
            <div>Грануляційний склад, фракція, &gt; 20 мм: {state.granulation_mt_20}</div>
            <div>Грануляційний склад, фракція, &gt; 60 мм: {state.granulation_mt_60}</div>
            <div>Грануляційний склад, фракція, &gt; 80 мм: {state.granulation_mt_80}</div>
          </When>
          <Otherwise>
            <LoaderMini />
          </Otherwise>
        </Choose>
      </If>
    </>
  );
}

SignedCR.defaultProps = {};

export default view(SignedCR);
