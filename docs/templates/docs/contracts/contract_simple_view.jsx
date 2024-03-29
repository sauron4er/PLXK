'use strict';
import * as React from 'react';
import 'static/css/files_uploader.css';
import 'static/css/loader_style.css';
import 'react-toastify/dist/ReactToastify.min.css';
import {notify} from 'templates/components/my_extras';
import {Loader} from 'templates/components/loaders';
import {axiosGetRequest} from 'templates/components/axios_requests';
import Files from 'templates/components/form_modules/files';

class ContractView extends React.Component {
  state = {
    loading: true,
    contract: {}
  };

  componentDidMount() {
    if (this.props.id !== 0) {
      this.getContract();
    } else {
      this.setState({loading: false});
    }
  }

  getContract = () => {
    axiosGetRequest('get_contract/' + this.props.id + '/')
      .then((response) => {
        this.setState({
          contract: response.contract,
          read_access: response.read_access,
          loading: false
        });
      })
      .catch((error) => notify(error));
  };

  render() {
    const {loading, contract, read_access} = this.state;

    if (!loading) {
      return (
        <div className='shadow-lg p-3 mb-5 bg-white rounded'>
          <div className='modal-header d-flex'>
            <h5 className='ml-auto'>{'Договір № ' + contract.id}</h5>
          </div>
          <div className='modal-body'>
            <div>
              <span className='font-italic'>Номер Договору: </span>
              {contract.number}
            </div>
            <hr />
            <div>
              <span className='font-italic'>Предмет: </span>
              {contract.subject}
            </div>
            <hr />
            <div>
              <span className='font-italic'>Контрагент: </span>
              {contract.counterparty_name === '' ? contract.counterparty_old : contract.counterparty_name}
            </div>
            <If condition={contract.nomenclature_group}>
              <hr />
              <div>
                <span className='font-italic'>Номенклатурна група: </span>
                {contract.nomenclature_group}
              </div>
            </If>
            <hr />
            <div>
              <span className='font-italic'>Початок дії: </span>
              {contract.date_start}
            </div>
            <hr />
            <div>
              <span className='font-italic'>Кінець дії: </span>
              {contract.date_end}
            </div>
            <If condition={contract.department_name}>
              <hr />
              <div>
                <span className='font-italic'>Місцезнаходження договору: </span>
                {contract.department_name}
              </div>
            </If>
            <hr />
            <div>
              <span className='font-italic'>Відповідальна особа: </span>
              {contract.responsible_name}
            </div>
            <If condition={read_access}>
              <hr />
              <Files oldFiles={contract.old_files} fieldName={'Підписані файли'} disabled={true} />
            </If>
          </div>
        </div>
      );
    } else {
      return <Loader />;
    }
  }

  static defaultProps = {
    id: 0
  };
}

export default ContractView;
