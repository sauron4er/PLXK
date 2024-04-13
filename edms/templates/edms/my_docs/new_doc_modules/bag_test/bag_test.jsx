'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from 'edms/templates/edms/my_docs/new_doc_modules/new_doc_store';
import BagTestField from 'edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test_field';
import BagTestFile from 'edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test_file';
import ModuleWrap from 'edms/templates/edms/my_docs/new_doc_modules/module_wrap';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selectors/selector_with_filter_and_axios';
import BagTestClientRequirements from 'edms/templates/edms/my_docs/new_doc_modules/bag_test/bag_test_cr/bag_test_client_requirements';

function BagTest(props) {
  function onBagTypeChange(e) {
    switch (e.target.value) {
      case '':
        newDocStore.new_document.bag_test_fields.bag_type = '';
        break;
      case 'paper_bag':
        newDocStore.new_document.bag_test_fields.bag_type = 'Паперовий мішок для деревного вугілля';
        break;
      case 'briquette_paper_bag':
        newDocStore.new_document.bag_test_fields.bag_type = 'Паперовий мішок для деревновугільних брикетів';
        break;
      case 'big_bag':
        newDocStore.new_document.bag_test_fields.bag_type = 'Біг-бег';
        break;
      case 'q_bag':
        newDocStore.new_document.bag_test_fields.bag_type = 'Q-бег';
        break;
      case 'pallet':
        newDocStore.new_document.bag_test_fields.bag_type = 'Піддон';
        break;
      case 'tray':
        newDocStore.new_document.bag_test_fields.bag_type = 'Лоток для одноразових грилів';
        break;
      case 'stand':
        newDocStore.new_document.bag_test_fields.bag_type = 'Підставки для одноразових грилів';
        break;
    }
  }

  function onSamplesAreAvailableChange(e) {
    newDocStore.new_document.bag_test_fields.samples_are_available = !newDocStore.new_document.bag_test_fields.samples_are_available;
  }

  function onAddManualCRChange(e) {
    newDocStore.new_document.bag_test_fields.add_manual_CR = !newDocStore.new_document.bag_test_fields.add_manual_CR;
  }

  function onProviderChange(e) {
    newDocStore.new_document.bag_test_fields.provider = e.id;
    newDocStore.new_document.bag_test_fields.provider_name = e.name;
  }

  function onClientChange(e) {
    newDocStore.new_document.bag_test_fields.client = e.id;
    newDocStore.new_document.bag_test_fields.client_name = e.name;
    newDocStore.new_document.bag_test_fields.client_requirements = 0;
    newDocStore.new_document.bag_test_fields.client_requirements_name = '';
  }

  function onClientRequirementsChange(e) {
    newDocStore.new_document.bag_test_fields.client_requirements = e.id;
    newDocStore.new_document.bag_test_fields.client_requirements_name = e.name;
  }

  return (
    <div className='row'>
      <BagTestField name='test_type' label='* Тип тестування' length={1000} columns={12} read_only={true} />

      <ModuleWrap columns={6}>
        <small>* Постачальник</small>
        <SelectorWithFilterAndAxios
          listNameForUrl='counterparties/providers'
          selectId='provider'
          value={{
            name: [newDocStore.new_document.bag_test_fields.provider_name],
            id: [newDocStore.new_document.bag_test_fields.provider]
          }}
          onChange={onProviderChange}
          disabled={false}
        />
      </ModuleWrap>

      <ModuleWrap columns={6}>
        <small>* Клієнт</small>
        <SelectorWithFilterAndAxios
          listNameForUrl='clients/3'
          selectId='client'
          value={{
            name: [newDocStore.new_document.bag_test_fields.client_name],
            id: [newDocStore.new_document.bag_test_fields.client]
          }}
          onChange={onClientChange}
          disabled={false}
        />
      </ModuleWrap>

      <ModuleWrap>
        <div className='form-group mb-0'>
          <label htmlFor='bag_types' className='full_width'>
            <small>* Тип макету</small>
            <select name='bag_types' id='bag_types' className='form-control' onChange={onBagTypeChange}>
              <option value=''></option>
              <option value='paper_bag'>Паперовий мішок для деревного вугілля</option>
              <option value='briquette_paper_bag'>Паперовий мішок для деревновугільних брикетів</option>
              <option value='big_bag'>Біг-бег</option>
              <option value='q_bag'>Q-бег</option>
              <option value='pallet'>Піддон</option>
              <option value='tray'>Лоток для одноразових грилів</option>
              <option value='stand'>Підставки для одноразових грилів</option>
            </select>
          </label>
        </div>
      </ModuleWrap>

      <BagTestField name='name' label='* Назва макета' length={100} columns={12} />
      <BagTestFile
        name='tech_conditions_file'
        label='* Технічні умови до взірця ТУ У, ДСТУ'
        files={newDocStore.new_document.bag_test_fields.tech_conditions_file}
        columns={4}
      />
      <BagTestFile
        name='quality_certificate_file'
        label='* Сертифікат якості чи гарантійний лист'
        files={newDocStore.new_document.bag_test_fields.quality_certificate_file}
        columns={4}
      />
      <BagTestFile
        name='sanitary_conclusion_product_file'
        label='* Санітарний висновок на продукцію'
        files={newDocStore.new_document.bag_test_fields.sanitary_conclusion_product_file}
        columns={4}
      />
      <BagTestFile
        name='glue_certificate_file'
        label='* Сертифікат безпечності на клей'
        files={newDocStore.new_document.bag_test_fields.glue_certificate_file}
        columns={4}
      />
      <BagTestFile
        name='paint_certificate_file'
        label='* Сертифікат безпечності на фарбу'
        files={newDocStore.new_document.bag_test_fields.paint_certificate_file}
        columns={4}
      />
      <BagTestFile
        name='sanitary_conclusion_tu_file'
        label='* Санітарний висновок на ТУ'
        files={newDocStore.new_document.bag_test_fields.sanitary_conclusion_tu_file}
        columns={4}
      />
      <BagTestField name='length' label='* Довжина, см.' length={3} columns={3} />
      <BagTestField name='width' label='* Ширина, см.' length={3} columns={3} />
      <BagTestField name='depth' label='* Глибина, см.' length={3} columns={3} />
      <BagTestField name='weight' label='* Вага, кг' length={3} columns={3} />

      <BagTestField name='material' label='* Матеріал виготовлення' length={400} columns={9} />
      <BagTestField name='density' label='* Щільність, кг/м2' length={3} columns={3} />

      <BagTestFile
        name='material_certificate_file'
        label='Файл сертифікату на матеріал'
        files={newDocStore.new_document.bag_test_fields.material_certificate_file}
        columns={6}
      />
      <BagTestFile
        name='sample_design_file'
        label='Файл конструкції взірця (при наявності)'
        files={newDocStore.new_document.bag_test_fields.sample_design_file}
        columns={6}
      />

      <BagTestField name='layers' label='* Кількість шарів' length={1} columns={3} />
      <BagTestField name='color' label='* Колір' length={20} columns={2} />
      <BagTestField name='deadline' type='date' label='* Бажані терміни проведення тестування' length={1} columns={5} />

      <ModuleWrap columns={2}>
        <div className='form-group form-check'>
          <input type='checkbox' className='form-check-input' id='samples_are_available' onChange={onSamplesAreAvailableChange} />
          <label className='form-check-label' htmlFor='samples_are_available'>
            <small>* Наявні 20 взірців</small>
          </label>
        </div>
      </ModuleWrap>

      <ModuleWrap>
        <BagTestClientRequirements />
      </ModuleWrap>

      <BagTestField name='author_comment' label='Коментар' length={1000} columns={12} />
    </div>
  );
}

BagTest.defaultProps = {};

export default view(BagTest);
