'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import counterpartyStore from '../../components/counterparty_store';
import SubmitButton from 'templates/components/form_modules/submit_button';
import Selector from 'templates/components/form_modules/selector';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import {getIndex, isBlankOrZero, notify} from 'templates/components/my_extras';
import TextInput from 'templates/components/form_modules/text_input';
import DateInput from 'templates/components/form_modules/date_input';
import CertificatePauses from './certificate_pauses';
import {Loader} from 'templates/components/loaders';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle, faCircle, faTimesCircle, faPauseCircle} from '@fortawesome/free-regular-svg-icons';

class Certificate extends React.Component {
  state = {
    loading: true,
    save_button_value: 'Зберегти'
  };

  componentDidMount() {
    if (counterpartyStore.certificate.id !== 0) {
      this.getCertificate();
    } else {
      this.setState({loading: false});
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.id !== prevProps.id) {
      if (this.props.id !== 0) {
        this.getCertificate();
      } else if (this.props.id === 0) {
        counterpartyStore.clearCertificate();
      }
    }
  }

  getCertificate = () => {
    this.setState({loading: true});
    axiosGetRequest('get_certificate/' + counterpartyStore.certificate.id + '/')
      .then((response) => {
        this.setState({loading: false});
        counterpartyStore.certificate = response;
      })
      .catch((error) => notify(error));
  };

  areAllFieldsFilled = () => {
    if (isBlankOrZero(counterpartyStore.certificate.certification_type_id)) {
      notify('Заповніть поле "Тип сертифікації"');
      return false;
    } else if (isBlankOrZero(counterpartyStore.certificate.number)) {
      notify('Заповніть поле "Номер сертифікату"');
      return false;
    } else if (isBlankOrZero(counterpartyStore.certificate.start)) {
      notify('Заповніть поле "Початок дії"');
      return false;
    }
    return true;
  };

  postCertificate = () => {
    if (this.areAllFieldsFilled()) {
      let formData = new FormData();
      let certificate = {...counterpartyStore.certificate}
      certificate.end = certificate.end !== '' ? certificate.end : null
      formData.append('counterparty_id', JSON.stringify(counterpartyStore.counterparty.id));
      formData.append('certificate', JSON.stringify(certificate));

      axiosPostRequest('post_certificate/', formData)
        .then((response) => {
          counterpartyStore.certificate.id = response;
          counterpartyStore.changeCertificateStatus();
          counterpartyStore.changeCertificates();
          this.changeSaveButtonValue();
        })
        .catch((error) => notify(error));
    }
  };

  deactivateCertificate = () => {
    axiosPostRequest('deact_certificate/' + counterpartyStore.certificate.id + '/')
      .then((response) => {
        const cert_index = getIndex(counterpartyStore.certificate.id, counterpartyStore.certificates);
        let certificates = [...counterpartyStore.certificates];
        certificates.splice(cert_index, 1)
        counterpartyStore.certificates = [...certificates];
        counterpartyStore.certificate.id = -1
      })
      .catch((error) => notify(error));
  };

  onCertificationTypeChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    counterpartyStore.certificate.certification_type = e.target.options[selectedIndex].getAttribute('value');
    counterpartyStore.certificate.certification_type_id = e.target.options[selectedIndex].getAttribute('data-key');
  };

  onNumberChange = (e) => {
    counterpartyStore.certificate.number = e.target.value;
  };

  onDeclarationChange = (e) => {
    counterpartyStore.certificate.declaration = e.target.value;
  };

  onStartChange = (e) => {
    counterpartyStore.certificate.start = e.target.value;
  };

  onEndChange = (e) => {
    counterpartyStore.certificate.end = e.target.value;
  };

  onOldPlhkNumberChange = (e) => {
    counterpartyStore.certificate.old_plhk_number = e.target.value;
  };

  onProductionGroupsChange = (e) => {
    counterpartyStore.certificate.production_groups = e.target.value;
  };
  
  changeSaveButtonValue = () => {
    this.setState({save_button_value: 'Збережено'}, () => {
      setTimeout(() => { this.setState({save_button_value: 'Зберегти'})}, 10000);
    })
  };

  render() {
    const {certificate, certification_types} = counterpartyStore;
    const {edit_access} = window;
    const {loading, save_button_value} = this.state;
  
    return (
      <div className='shadow-lg p-3 mb-5 bg-white rounded'>
        <Choose>
          <When condition={!loading}>
            <div className='modal-header'>
              <div>
                <Choose>
                  <When condition={certificate.id !== 0}>
                    <div className='d-flex'>
                      <Choose>
                        <When condition={certificate.status === 'ok'}>
                          <div className='text-success'>
                            <FontAwesomeIcon icon={faCheckCircle} />
                          </div>
                        </When>
                        <When condition={certificate.status === 'paused'}>
                          <div className='text-warning'>
                            <FontAwesomeIcon icon={faPauseCircle} />
                          </div>
                        </When>
                        <Otherwise>
                          <div className='text-danger'>
                            <FontAwesomeIcon icon={faTimesCircle} />
                          </div>
                        </Otherwise>
                      </Choose>
                      <h5 className='ml-2'>{`Сертифікат ${certificate.certification_type} № ${certificate.number}`}</h5>
                    </div>
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
                text={certificate.production_groups}
                fieldName={'Групи продукції'}
                onChange={this.onProductionGroupsChange}
                maxLength={100}
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
              <div className='d-flex justify-content-between'>
                <DateInput date={certificate.start} fieldName={'* Початок дії'} onChange={this.onStartChange} disabled={!edit_access} />
                <DateInput date={certificate.end} fieldName={'Кінець дії'} onChange={this.onEndChange} disabled={!edit_access} />
              </div>
              <hr />
              <CertificatePauses />
              <hr />
              <TextInput
                text={certificate.old_plhk_number}
                fieldName={'Номер в системі PLXK'}
                onChange={this.onOldPlhkNumberChange}
                maxLength={10}
                disabled={!edit_access}
              />
            </div>

            <If condition={edit_access}>
              <div className='modal-footer'>
                <If condition={certificate.id === 0}>
                  <button className='btn btn-outline-dark' onClick={() => counterpartyStore.clearCertificate()}>
                    Очистити
                  </button>
                </If>
                <If condition={certificate.id !== 0}>
                  <SubmitButton className='btn-outline-danger' onClick={() => this.deactivateCertificate()} text='Видалити' />
                </If>
                <SubmitButton className='btn btn-outline-info' onClick={() => this.postCertificate()} text={save_button_value} />
              </div>
            </If>
          </When>
          <Otherwise>
            <Loader />
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

export default view(Certificate);
