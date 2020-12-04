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
          contract: response,
          loading: false
        })
      })
      .catch((error) => notify(error));
  };

  render() {
    const {loading, contract} = this.state;
  
    if (!loading) {
      return (
        <div className='shadow-lg p-3 mb-5 bg-white rounded'>
          <div className='modal-header d-flex'>
            <h5 className='ml-auto'>{'Договір № ' + contract.id}</h5>
          </div>
          <div className='modal-body'>
            <div><span className='font-italic'>Номер Договору: </span>{contract.number}</div><hr/>
            <div><span className='font-italic'>Предмет: </span>{contract.subject}</div><hr/>
            <div><span className='font-italic'>Контрагент: </span>{contract.counterparty}</div><hr/>
            <div><span className='font-italic'>Номенклатурна група: </span>{contract.nomenclature_group}</div><hr/>
            <div><span className='font-italic'>Початок дії: </span>{contract.date_start}</div><hr/>
            <div><span className='font-italic'>Кінець дії: </span>{contract.date_end}</div><hr/>
            <div><span className='font-italic'>Місцезнаходження договору: </span>{contract.department_name}</div><hr/>
            <div><span className='font-italic'>Відповідальна особа: </span>{contract.responsible_name}</div><hr/>

            <Files
              oldFiles={contract.old_files}
              fieldName={'Підписані файли'}
              disabled={true}
            />
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
