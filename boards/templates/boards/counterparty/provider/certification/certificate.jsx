'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import providerStore from '../provider_store';
import SubmitButton from 'templates/components/form_modules/submit_button';
import Selector from 'templates/components/form_modules/selector';
import {axiosGetRequest} from 'templates/components/axios_requests';
import contractsStore from 'docs/templates/docs/contracts/contracts_store';
import {notify} from 'templates/components/my_extras';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import CertificatePauses from './certificate_pauses';

class Certificate extends React.Component {
  state = {
    loading: true
  };

  postCertificate = () => {};

  delCertificate = () => {};

  onCertificationTypeChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    providerStore.certificate.certification_type = e.target.options[selectedIndex].getAttribute('value');
    providerStore.certificate.certification_type_id = e.target.options[selectedIndex].getAttribute('data-key');
  };

  onNumberChange = (e) => {
    providerStore.certificate.number = e.target.value;
  };

  onDeclarationChange = (e) => {
    providerStore.certificate.declaration = e.target.value;
  };

  onStartChange = (e) => {
    providerStore.certificate.start = e.target.value;
  };

  onEndChange = (e) => {
    providerStore.certificate.end = e.target.value;
  };

  onOldPlhkNumberChange = (e) => {
    providerStore.certificate.old_plhk_number = e.target.value;
  };

  render() {
    const {certificate, certification_types, edit_access} = providerStore;

    return (
      <div className='shadow-lg p-3 mb-5 bg-white rounded'>
        <div className='modal-header'>
          <div>
            <Choose>
              <When condition={certificate.id !== 0}>
                <h5>{`Сертифікат ${certificate.certification_type} № ${certificate.number}`}</h5>
              </When>
              <Otherwise>
                <h5>{'Новий сертифікат'}</h5>
              </Otherwise>
            </Choose>
            <small>Поля, позначені зірочкою, є обов’язковими</small>
          </div>
        </div>

        <div className='modal-body'>
          <Selector
            list={certification_types}
            selectedName={certificate.certification_type}
            valueField={'name'}
            fieldName={'* Тип сертифікації'}
            onChange={this.onCertificationTypeChange}
            disabled={!edit_access}
          />
          <hr />
          <TextInput
            text={certificate.number}
            fieldName={'* Номер сертифікату'}
            onChange={this.onNumberChange}
            maxLength={20}
            disabled={!edit_access}
          />
          <hr />
          <TextInput
            text={certificate.declaration}
            fieldName={'Заява'}
            onChange={this.onDeclarationChange}
            maxLength={100}
            disabled={!edit_access}
          />
          <hr />
          <TextInput
            text={certificate.old_plhk_number}
            fieldName={'Номер в системі PLXK'}
            onChange={this.onOldPlhkNumberChange}
            maxLength={10}
            disabled={!edit_access}
          />
          <hr />
          <div className='d-flex justify-content-between'>
            <DateInput date={certificate.start} fieldName={'Початок дії'} onChange={this.onStartChange} disabled={!edit_access} />
            <DateInput date={certificate.end} fieldName={'Кінець дії'} onChange={this.onEndChange} disabled={!edit_access} />
          </div>
          <hr />
          <CertificatePauses/>
        </div>

        <If condition={edit_access}>
          <div className='modal-footer'>
            <If condition={certificate.id === 0}>
              <button className='btn btn-outline-dark' onClick={() => providerStore.clearCertificate()}>
                Очистити
              </button>
            </If>
            <If condition={certificate.id !== 0}>
              <SubmitButton className='btn-outline-danger' onClick={() => this.delCertificate()} text='Видалити' />
            </If>
            <SubmitButton className='btn btn-outline-info' onClick={() => this.postCertificate()} text='Зберегти' />
          </div>
        </If>
      </div>
    );
  }
}

export default view(Certificate);
