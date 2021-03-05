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

class CertificatePauses extends React.Component {
  state = {
    loading: true
  };

  render() {
    const {pauses} = providerStore.certificate;

    return (
      <div className='shadow-lg p-3 mb-5 bg-white rounded'>
        <div>Додати паузу</div>
        <div className='mt-1'>Попередні паузи:</div>
        <table className="table table-sm">
          <thead className="thead-inverse">
          <tr>
            <th>Дата початку</th>
            <th>Дата кінця</th>
          </tr>
          </thead>
          <tbody>
          
          </tbody>
        </table>
        Паузи
      </div>
    );
  }
}

export default view(CertificatePauses);
