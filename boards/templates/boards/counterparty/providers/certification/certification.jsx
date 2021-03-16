'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import counterpartyStore from '../../components/counterparty_store';
import DxTable from 'templates/components/tables/dx_table';
import Certificate from './certificate';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import {LoaderSmall} from 'templates/components/loaders';

const columns = [
  {name: 'certification_type', title: 'Тип'},
  {name: 'number', title: 'Номер'},
  {name: 'status', title: ''}
];

const col_width = [
  {columnName: 'certification_type', width: 80},
  {columnName: 'status', width: 30}
];

class Certification extends React.Component {
  state = {
    loading: true
  };

  componentDidMount() {
    axiosGetRequest(`get_certification/${counterpartyStore.counterparty.id}/`)
      .then((response) => {
        counterpartyStore.certification_types = response.cert_types;
        counterpartyStore.certificates = response.certificates;
        this.setState({loading: false});
      })
      .catch((error) => notify(error));
  }

  onRowClick = (row) => {
    counterpartyStore.certificate.id = row.id;
  };

  render() {
    const {certificates, certificate} = counterpartyStore;
    const {edit_access} = window;
    const {loading} = this.state;

    return (
      <div className='row'>
        <div className='col-4'>
          <If condition={edit_access}>
            <button className='btn btn-sm btn-outline-dark form-control' onClick={() => (counterpartyStore.certificate.id = 0)}>
              Додати сертифікат
            </button>
          </If>

          <Choose>
            <When condition={!loading}>
              <DxTable
                rows={certificates}
                columns={columns}
                defaultSorting={[{columnName: 'id', direction: 'desc'}]}
                colWidth={col_width}
                onRowClick={this.onRowClick}
                height={500}
                coloredStatus
                filter
              />
            </When>
            <Otherwise>
              <LoaderSmall />
            </Otherwise>
          </Choose>
        </div>
        <div className='col-8'>
          <If condition={certificate.id !== -1}>
            <Certificate id={counterpartyStore.certificate.id} />
          </If>
        </div>
      </div>
    );
  }
}

export default view(Certification);
