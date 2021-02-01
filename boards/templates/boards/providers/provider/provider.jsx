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
import providerStore from './provider_store';
import ProviderInfo from './info';
import ProviderCertification from './certification';
import ProviderMap from './map';
import ProviderContracts from './contracts';
import SubmitButton from 'templates/components/form_modules/submit_button';
import {ToastContainer} from 'react-toastify';

class Provider extends React.Component {
  state = {
    loading: true
  };

  componentDidMount() {
    if (this.props.id !== 0) {
      this.getProvider();
    } else {
      this.setState({loading: false});
      providerStore.edit_access = true;
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.id !== this.props.id && this.props.id !== 0) this.getContract();
  }

  getProvider = () => {
    axiosGetRequest('get_provider/' + this.props.id + '/')
      .then((response) => {
        this.setState({
          provider: response.provider,
          loading: false
        });
        providerStore.edit_access = response.edit_access;
      })
      .catch((error) => notify(error));
  };

  areAllFieldsFilled = () => {
    if (isBlankOrZero(providerStore.provider.name)) {
      notify('Заповніть поле "Назва"');
      return false;
    }
    return true;
  };

  postProvider = () => {
    if (this.areAllFieldsFilled()) {
      
      let formData = new FormData();
      formData.append('provider', JSON.stringify(providerStore.provider));
      
      axiosPostRequest('post_provider/', formData)
      .then((response) => {
        location.reload();
      })
      .catch((error) => notify(error));
    }
  };

  deactivateProvider = () => {
    axiosPostRequest('deactivate_provider/' + this.props.id + '/')
      .then((response) => {
        location.reload();
      })
      .catch((error) => notify(error));
  };

  render() {
    const {loading} = this.state;
    return (
      <Choose>
        <When condition={!loading}>
          <div className='shadow-lg p-3 mb-5 bg-white rounded'>
            <Tabs>
              <TabList>
                <Tab>Загальна інформація</Tab>
                <Tab>Договори</Tab>
                <Tab>Сертифікація</Tab>
                <Tab>Постачальник на мапі</Tab>
              </TabList>
        
              <TabPanel>
                <ProviderInfo/>
                <If condition={providerStore.edit_access}>
                  <div className='modal-footer'>
                    <SubmitButton className='btn-info' text='Зберегти' onClick={this.postProvider}/>
              
                    <If condition={providerStore.provider.id !== 0}>
                      <SubmitButton className='float-sm-right btn-danger' text='Видалити'
                                    onClick={this.deactivateProvider}/>
                    </If>
                  </div>
                </If>
              </TabPanel>
              <TabPanel>
                <ProviderContracts/>
              </TabPanel>
              <TabPanel>
                <ProviderCertification/>
              </TabPanel>
              <TabPanel>
                <ProviderMap/>
              </TabPanel>
            </Tabs>
      
            {/*Вспливаюче повідомлення*/}
            <ToastContainer/>
          </div>
        </When>
        <Otherwise>
          <Loader/>
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    id: 0
  };
}

export default view(Provider);
