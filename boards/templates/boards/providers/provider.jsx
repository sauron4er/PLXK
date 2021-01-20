'use strict';
import * as React from 'react';
import 'static/css/files_uploader.css';
import 'static/css/loader_style.css';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {notify} from 'templates/components/my_extras';
import {Loader} from 'templates/components/loaders';
import {view, store} from '@risingstack/react-easy-state';
import {axiosPostRequest, axiosGetRequest} from 'templates/components/axios_requests';
import providersStore from './providers_store';

class Provider extends React.Component {
  state = {
    data_received: false,
    edit_mode: providersStore.full_edit_access || this.props.id === 0
  };

  componentDidMount() {
    if (this.props.id !== 0) {
      this.getProvider();
    } else {
      this.setState({data_received: true});
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.id !== this.props.id && this.props.id !== 0) this.getContract();
  }

  getProvider = () => {
    axiosGetRequest('get_provider/' + this.props.id + '/')
      .then((response) => {
        this.setState({
          provider: response,
          edit_mode: providersStore.full_edit_access || response.is_author,
          data_received: true
        });
      })
      .catch((error) => notify(error));
  };

  areAllFieldsFilled = () => {
    const {provider} = this.state;
    // if (isBlankOrZero(contract.number)) {
    //   notify('Заповніть поле "Номер Договору"');
    //   return false;
    // }
    // if (isBlankOrZero(contract.subject)) {
    //   notify('Заповніть поле "Предмет Договору"');
    //   return false;
    // }
    // if (isBlankOrZero(contract.counterparty)) {
    //   notify('Заповніть поле "Контрагент"');
    //   return false;
    // }
    // if (isBlankOrZero(contract.date_start)) {
    //   notify('Оберіть дату початку дії Договору');
    //   return false;
    // }
    // if (isBlankOrZero(contract.new_files) && isBlankOrZero(contract.old_files)) {
    //   notify('Додайте підписаний файл Договору');
    //   return false;
    // }
    return true;
  };

  areDatesInOrder = () => {
    // const {provider} = this.state;
    // if (contract.date_end && contract.date_end < contract.date_start) {
    //   notify('Ви неправильно обрали термін дії Договору');
    //   return false;
    // }
    return true;
  };

  changeTableAndClose = (mode) => {
    const {provider} = this.state;
  };

  postProvider = () => {
    const {provider} = this.state;
  };

  postDelProvider = () => {
    axiosPostRequest('deactivate_provider/' + this.props.id + '/')
      .then((response) => {
        this.changeTableAndClose('del');
      })
      .catch((error) => notify(error));
  };

  render() {
    return <>Постачальник</>;
  }

  static defaultProps = {
    id: 0,
  };
}

export default view(Provider);
