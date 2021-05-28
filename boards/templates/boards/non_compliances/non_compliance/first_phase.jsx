'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from './non_compliance_store';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import NCRow from 'boards/templates/boards/non_compliances/non_compliance/row';
import NCItem from 'boards/templates/boards/non_compliances/non_compliance/item';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selector_with_filter_and_axios';
import Files from 'templates/components/form_modules/files';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {isBlankOrZero, notify} from 'templates/components/my_extras';

class NCFirstPhase extends React.Component {
  state = {
    editable: false
  };

  componentDidMount() {
    if (nonComplianceStore.non_compliance.phase === 0) {
      nonComplianceStore.non_compliance.author = user;
      nonComplianceStore.non_compliance.author_name = user_name;
      nonComplianceStore.non_compliance.dep_chief = window.dep_chief.id;
      nonComplianceStore.non_compliance.dep_chief_name = window.dep_chief.name;
    }

    if (nonComplianceStore.non_compliance.phase < 2 && nonComplianceStore.non_compliance.author === user) {
      this.setState({editable: true});
    }
  }

  onProductChange = (e) => {
    nonComplianceStore.non_compliance.product = e.id;
    nonComplianceStore.non_compliance.product_name = e.name;
  };

  onProviderChange = (e) => {
    nonComplianceStore.non_compliance.provider = e.id;
    nonComplianceStore.non_compliance.provider_name = e.name;
  };

  onIdentifiedByChange = (e) => {
    nonComplianceStore.non_compliance.identified_by = e.id;
    nonComplianceStore.non_compliance.identified_by_name = e.name;
  };

  onFilesChange = (e) => {
    nonComplianceStore.non_compliance.new_files = e.target.value;
  };

  areFirstPhaseFieldsFilled = () => {
    const first_phase_fields = {
      registration_number: '№ реєстрації',
      date_added: 'Дата',
      name: 'Назва продукції',
      product: 'Вид продукції',
      party_number: 'Номер партії',
      order_number: 'Номер замовлення',
      quantity: 'Кількість',
      packing_type: 'Тип фасування та кількість',
      provider: 'Постачальник',
      reason_big: 'Причина невідповідності',
      new_files: 'Завантажити фото чи документи',
      codification: 'Кодифікація невідповідності',
      defect: 'Дефект',
      reason: 'Причина',
      sector: 'Сектор'
    };

    for (const [key, value] of Object.entries(first_phase_fields)) {
      if (isBlankOrZero(nonComplianceStore.non_compliance[key])) {
        notify(`Заповніть поле "${value}"`);
        return false;
      }
    }
    return true;
  };

  postNonCompliance = () => {
    if (this.areFirstPhaseFieldsFilled()) {
      let formData = new FormData();
      formData.append('non_compliance', JSON.stringify(nonComplianceStore.non_compliance));

      axiosPostRequest('post_non_compliance', formData)
        .then((response) => {
          // location.reload();
        })
        .catch((error) => notify(error));
    }
  };

  postDepChiefApproval = (approved) => {
    let formData = new FormData();
    formData.append('non_compliance_id', nonComplianceStore.non_compliance.id);
    formData.append('approved', approved);

    axiosPostRequest('dc_approval', formData)
      .then((response) => {
        nonComplianceStore.non_compliance.dep_chief_approval = approved;
      })
      .catch((error) => notify(error));
  };

  render() {
    const {non_compliance, onFormChange} = nonComplianceStore;
    const {editable} = this.state;

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
                  disabled={!editable}
                  onChange={(e) => onFormChange(e, 'registration_number')}
                />
              </NCItem>
              <NCItem cols='3'>
                Дата:
                <DateInput date={non_compliance.date_added} disabled={!editable} onChange={(e) => onFormChange(e, 'date_added')} />
              </NCItem>
              <NCItem cols='5'>
                Пірозділ-ініціатор:
                <div className='font-weight-bold'>{department}</div>
              </NCItem>
            </NCRow>
            <NCRow>
              <NCItem cols='4'>
                Назва продукції:
                <TextInput text={non_compliance.name} maxLength={100} disabled={!editable} onChange={(e) => onFormChange(e, 'name')} />
              </NCItem>
              <NCItem cols='4'>
                <SelectorWithFilterAndAxios
                  listNameForUrl='products'
                  fieldName={'Вид продукції'}
                  value={{name: non_compliance.product_name, id: non_compliance.product}}
                  onChange={this.onProductChange}
                  disabled={!editable}
                />
              </NCItem>
              <NCItem cols='4'>
                Номер партії:
                <TextInput
                  text={non_compliance.party_number}
                  maxLength={15}
                  disabled={!editable}
                  onChange={(e) => onFormChange(e, 'party_number')}
                />
              </NCItem>
            </NCRow>
          </div>
          <NCItem cols='3'>
            Віза начальника підрозділу:
            <div className='font-weight-bold'>{window.dep_chief.name}</div>
            <Choose>
              <When condition={non_compliance.dep_chief_approval === true}>
                <div className='border border-success rounded p-1 mt-1 text-center text-success font-weight-bold'>Погоджено</div>
              </When>
              <When condition={non_compliance.dep_chief_approval === false}>
                <div className='border border-danger rounded p-1 mt-1 text-center text-danger font-weight-bold'>Відмовлено</div>
              </When>
              <Otherwise>
                <If condition={user === non_compliance.dep_chief}>
                  <SubmitButton className='btn-info' text='Погодити' onClick={(e) => this.postDepChiefApproval(true)} />
                  <SubmitButton className='btn-danger ml-1' text='Відмовити' onClick={(e) => this.postDepChiefApproval(false)} />
                </If>
              </Otherwise>
            </Choose>
          </NCItem>
        </NCRow>

        <NCRow>
          <NCItem cols='3'>
            Номер замовлення:
            <TextInput
              text={non_compliance.order_number}
              maxLength={10}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'order_number')}
            />
          </NCItem>
          <NCItem cols='3'>
            Кількість:
            <TextInput text={non_compliance.quantity} maxLength={5} disabled={!editable} onChange={(e) => onFormChange(e, 'quantity')} />
          </NCItem>
          <NCItem cols='3'>
            Тип фасування та кількість:
            <TextInput
              text={non_compliance.packing_type}
              maxLength={15}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'packing_type')}
            />
          </NCItem>
          <NCItem cols='3'>
            <SelectorWithFilterAndAxios
              listNameForUrl='providers'
              fieldName={'Постачальник'}
              value={{name: non_compliance.provider_name, id: non_compliance.provider}}
              onChange={this.onProviderChange}
              disabled={!editable}
            />
          </NCItem>
        </NCRow>
        <NCRow>
          <NCItem cols='8'>
            <div>Причина невідповідності (уточнити % з дефектом та результати аналізу)</div>
            <TextInput
              text={non_compliance.reason_big}
              maxLength={5000}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'reason_big')}
            />
          </NCItem>
          <NCItem cols='4'>
            <Files
              oldFiles={non_compliance.old_files}
              newFiles={non_compliance.new_files}
              fieldName={'Завантажити фото чи документи'}
              onChange={this.onFilesChange}
              onDelete={() => {}}
              disabled={!editable}
            />
          </NCItem>
        </NCRow>
        <NCRow>
          <NCItem cols='3'>
            <TextInput
              fieldName='Кодифікація невідповідності'
              text={non_compliance.codification}
              maxLength={100}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'codification')}
            />
          </NCItem>
          <NCItem cols='3'>
            <TextInput
              fieldName='Дефект'
              text={non_compliance.defect}
              maxLength={100}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'defect')}
            />
          </NCItem>
          <NCItem cols='3'>
            <TextInput
              fieldName='Причина'
              text={non_compliance.reason}
              maxLength={100}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'reason')}
            />
          </NCItem>
          <NCItem cols='3'>
            <TextInput
              fieldName='Сектор'
              text={non_compliance.sector}
              maxLength={100}
              disabled={!editable}
              onChange={(e) => onFormChange(e, 'sector')}
            />
          </NCItem>
        </NCRow>
        <NCRow>
          <NCItem cols={9}>
            <small>Замітка: у випадку фасованого продукту, завершення виробництва та надання статусу «Карантин»</small>
            <div className='mb-1'>
              <small>
                Артикули: перевірити необхідність вважати залишок партії невідповідною – надати взірці та етикетки від постачальника
              </small>
            </div>
          </NCItem>
          <NCItem cols={3}>
            <div>Автор:</div>
            <div className='font-weight-bold'>{non_compliance.author_name}</div>
          </NCItem>
        </NCRow>
        <If condition={non_compliance.phase < 2 && non_compliance.author === user}>
          <NCRow>
            <NCItem>
              <SubmitButton className='btn-info' text='Зберегти' onClick={this.postNonCompliance} />
            </NCItem>
          </NCRow>
        </If>
      </div>
    );
  }
}

export default view(NCFirstPhase);
