'use strict';
import * as React from 'react';
import 'static/css/files_uploader.css';
import 'static/css/loader_style.css';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.min.css';
import {notify, isBlankOrZero} from 'templates/components/my_extras';
import {Loader} from 'templates/components/loaders';
import {view, store} from '@risingstack/react-easy-state';
import {axiosPostRequest, axiosGetRequest} from 'templates/components/axios_requests';
import counterpartyStore from './counterparty_store';
import CounterpartyInfo from './info';
import CounterpartyContracts from './contracts';
import Certification from '../providers/certification/certification';
import CounterpartyMap from './map';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {ToastContainer} from 'react-toastify';
import CounterpartyCorrespondence from './correspondence';
import CounterpartyMockups from 'boards/templates/boards/counterparty/clients/mockups';
import CounterpartyRequirements from 'boards/templates/boards/counterparty/clients/requirements';
import CounterpartyNonCompliances from "boards/templates/boards/counterparty/components/non_compliances";

class Counterparty extends React.Component {
  state = {
    loading: true
  };

  componentDidMount() {
    if (this.props.id !== 0) {
      this.getCounterparty();
    } else {
      this.setState({loading: false});
    }
  }

  getCounterparty = () => {
    const url = counterpartyStore.type === 'provider' ? 'get_provider/' : 'get_client/';
    axiosGetRequest(url + this.props.id + '/')
      .then((response) => {
        this.setState({loading: false});
        counterpartyStore.counterparty = response.counterparty;
        counterpartyStore.scopes = response.scopes;
        counterpartyStore.employees = response.employees;
      })
      .catch((error) => notify(error));
  };

  areAllFieldsFilled = () => {
    if (isBlankOrZero(counterpartyStore.counterparty.name)) {
      notify('Заповніть поле "Назва"');
      return false;
    } else if (isBlankOrZero(counterpartyStore.counterparty.product_id)) {
      notify('Заповніть поле "Продукція"');
      return false;
    }
    return true;
  };

  postCounterparty = () => {
    if (this.areAllFieldsFilled()) {
      let formData = new FormData();
      formData.append('counterparty', JSON.stringify(counterpartyStore.counterparty));

      const url = counterpartyStore.type === 'provider' ? 'post_provider/' : 'post_client/';

      axiosPostRequest(url, formData)
        .then((response) => {
          location.reload();
        })
        .catch((error) => notify(error));
    }
  };

  deactivateCounterparty = () => {
    axiosPostRequest('deact_counterparty/' + this.props.id + '/')
      .then((response) => {
        location.reload();
      })
      .catch((error) => notify(error));
  };

  render() {
    const {loading} = this.state;
    const {edit_access} = window;
    const {counterparty, type} = counterpartyStore;

    return (
      <Choose>
        <When condition={!loading}>
          <div className='shadow-lg p-3 mb-5 bg-white rounded'>
            <Tabs>
              <TabList>
                <Tab>Загальна інформація</Tab>
                <Tab>Договори</Tab>
                <If condition={type === 'provider'}>
                  <Tab>Сертифікація</Tab>
                  <Tab>Акти невідповідності</Tab>
                </If>
                <If condition={type === 'client'}>
                  <Tab>Листування</Tab>
                  <Tab>Дизайн-макети</Tab>
                  <Tab>Вимоги</Tab>
                </If>
                <Tab>{type === 'provider' ? 'Постачальник на мапі' : 'Клієнт на мапі'}</Tab>
              </TabList>

              <TabPanel>
                <CounterpartyInfo />
                <If condition={edit_access}>
                  <div className='modal-footer'>
                    <SubmitButton className='btn-info' text='Зберегти' onClick={this.postCounterparty} />

                    <If condition={counterpartyStore.counterparty.id !== 0}>
                      <SubmitButton className='float-sm-right btn-danger btn-sm' text='Видалити' onClick={this.deactivateCounterparty} />
                    </If>
                  </div>
                </If>
              </TabPanel>
              <TabPanel>
                <CounterpartyContracts />
              </TabPanel>
              <If condition={type === 'provider'}>
                <TabPanel>
                  <Certification />
                </TabPanel>
                <TabPanel>
                  <CounterpartyNonCompliances />
                </TabPanel>
              </If>
              <If condition={type === 'client'}>
                <TabPanel>
                  <CounterpartyCorrespondence />
                </TabPanel>
                <TabPanel>
                  <CounterpartyMockups />
                </TabPanel>
                <TabPanel>
                  <CounterpartyRequirements />
                </TabPanel>
              </If>
              <TabPanel>
                <CounterpartyMap />
              </TabPanel>
            </Tabs>

            {/*Вспливаюче повідомлення*/}
            <ToastContainer />
          </div>
        </When>
        <Otherwise>
          <Loader />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    id: 0
  };
}

export default view(Counterparty);
