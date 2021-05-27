'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from './non_compliance_store';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import NCRow from 'boards/templates/boards/non_compliances/non_compliance/row';
import NCItem from 'boards/templates/boards/non_compliances/non_compliance/item';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selector_with_filter_and_axios';
import SelectorWithFilter from 'templates/components/form_modules/selector_with_filter';
import NCThirdPhase from 'boards/templates/boards/non_compliances/non_compliance/third_phase';
import Files from 'templates/components/form_modules/files';
import FilesUpload from 'templates/components/files_uploader/files_upload';

class NCFirstPhase extends React.Component {
  onProductChange = (e) => {
    nonComplianceStore.non_compliance.product = e.id;
    nonComplianceStore.non_compliance.product_name = e.name;
  };

  onCounterpartyChange = (e) => {
    nonComplianceStore.non_compliance.counterparty = e.id;
    nonComplianceStore.non_compliance.counterparty_name = e.name;
  };

  onIdentifiedByChange = (e) => {
    nonComplianceStore.non_compliance.identified_by = e.id;
    nonComplianceStore.non_compliance.identified_by_name = e.name;
  };
  
  onFilesChange = (e) => {
    nonComplianceStore.non_compliance.new_files = e.target.value;
  };

  render() {
    const {non_compliance, onFormChange, employees} = nonComplianceStore;

    return (
      <div style={{borderBottom: '2px solid grey'}}>
        <NCRow>
          <div className='col-lg-9 align-content-start p-0'>
            <NCRow>
              <NCItem cols='4'>
                № реєстрації:
                <TextInput
                  text={non_compliance.registration_number}
                  maxLength={15}
                  disabled={false}
                  onChange={(e) => onFormChange(e, 'registration_number')}
                />
              </NCItem>
              <NCItem cols='3'>
                Дата:
                <DateInput date={non_compliance.date_added} disabled={false} onChange={(e) => onFormChange(e, 'date_added')} />
              </NCItem>
              <NCItem cols='5'>
                Пірозділ-ініціатор:
                <div className='font-weight-bold'>{department}</div>
              </NCItem>
            </NCRow>
            <NCRow>
              <NCItem cols='4'>
                Назва продукції:
                <TextInput text={non_compliance.name} maxLength={100} disabled={false} onChange={(e) => onFormChange(e, 'product_name')} />
              </NCItem>
              <NCItem cols='4'>
                <SelectorWithFilterAndAxios
                  listNameForUrl='products'
                  fieldName={'Вид продукції'}
                  value={{name: non_compliance.product_name, id: non_compliance.product}}
                  onChange={this.onProductChange}
                  disabled={false}
                />
              </NCItem>
              <NCItem cols='4'>
                Номер партії:
                <TextInput
                  text={non_compliance.party_number}
                  maxLength={15}
                  disabled={false}
                  onChange={(e) => onFormChange(e, 'party_number')}
                />
              </NCItem>
            </NCRow>
          </div>
          <NCItem cols='3'>
            Віза начальника підрозділу:
            <div className='font-weight-bold'>{window.dep_chief.name}</div>
          </NCItem>
        </NCRow>

        <NCRow>
          <NCItem cols='3'>
            Номер замовлення:
            <TextInput
              text={non_compliance.order_number}
              maxLength={10}
              disabled={false}
              onChange={(e) => onFormChange(e, 'order_number')}
            />
          </NCItem>
          <NCItem cols='3'>
            Кількість:
            <TextInput text={non_compliance.quantity} maxLength={5} disabled={false} onChange={(e) => onFormChange(e, 'quantity')} />
          </NCItem>
          <NCItem cols='3'>
            Тип фасування та кількість:
            <TextInput
              text={non_compliance.packing_type}
              maxLength={15}
              disabled={false}
              onChange={(e) => onFormChange(e, 'packing_type')}
            />
          </NCItem>
          <NCItem cols='3'>
            <SelectorWithFilterAndAxios
              listNameForUrl='counterparties'
              fieldName={'Замовник/постачальник'}
              value={{name: non_compliance.counterparty_name, id: non_compliance.counterparty}}
              onChange={this.onCounterpartyChange}
              disabled={false}
            />
          </NCItem>
        </NCRow>
        <NCRow>
          <NCItem cols='8'>
            <div>Причина невідповідності (уточнити % з дефектом та результати аналізу)</div>
            <TextInput text={non_compliance.reason} maxLength={5000} disabled={false} onChange={(e) => onFormChange(e, 'reason')} />
          </NCItem>
          <NCItem cols='4'>
            <Files
              oldFiles={non_compliance.old_files}
              newFiles={non_compliance.new_files}
              fieldName={'Завантажити фото чи документи'}
              onChange={this.onFilesChange}
              onDelete={() => {}}
              disabled={false} />
          </NCItem>
        </NCRow>
        <NCRow>
          <NCItem cols='7'>
            <SelectorWithFilter
              list={employees}
              fieldName={'Ідентифікацію невідповідності здійснено'}
              value={{name: non_compliance.identified_by_name, id: non_compliance.identified_by}}
              onChange={this.onIdentifiedByChange}
              disabled={false}
            />
          </NCItem>
          <NCItem cols='5'>Віза про надання інформативного статусу</NCItem>
        </NCRow>
        <NCRow>
          <NCItem>
            <small>Замітка: у випадку фасованого продукту, завершення виробництва та надання статусу «Карантин»</small>
            <div className='mb-1'>
              <small>
                Артикули: перевірити необхідність вважати залишок партії невідповідною – надати взірці та етикетки від постачальника
              </small>
            </div>
          </NCItem>
        </NCRow>
      </div>
    );
  }
}

export default view(NCFirstPhase);
