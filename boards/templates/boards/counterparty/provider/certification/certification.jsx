'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import providerStore from '../provider_store';
import DxTable from 'templates/components/tables/dx_table';
import Certificate from './certificate';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

class Certification extends React.Component {
  
  componentDidMount() {
    axiosGetRequest('get_cert_types/')
      .then((response) => {
        providerStore.certification_types = response
      })
      .catch((error) => notify(error));
  }

  onRowClick = (row) => {
    providerStore.certificate.id = row.id
  };

  render() {
    const {certificate} = providerStore;

    return (
      <div className='row'>
        <div className='col-4'>
          <button className='btn btn-sm btn-outline-dark form-control' onClick={() => providerStore.certificate.id = 0}>
            Додати сертифікат
          </button>
          <div className='my-1'>Сертифікати</div>

          <DxTable
            rows={[]}
            columns={[]}
            defaultSorting={[{columnName: 'id', direction: 'desc'}]}
            colWidth={[]}
            onRowClick={this.onRowClick}
            height={500}
            filter
          />
        </div>
        <div className='col-8'>
          <If condition={certificate.id !== -1}>
            <Certificate />
          </If>
        </div>
      </div>
    );
  }
}

export default view(Certification);
