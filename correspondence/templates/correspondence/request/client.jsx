'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';
import {getIndex} from 'templates/components/my_extras';

class Client extends React.Component {
  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    corrStore.request.client_id = event.target.options[selectedIndex].getAttribute('data-key');
    corrStore.request.client_name = event.target.options[selectedIndex].getAttribute('value');
  };

  render() {
    return (
      <>
        <div className='row align-items-center mt-1 mr-lg-1'>
          <label className='col-lg-1' htmlFor='client'>
            Клієнт:
          </label>
          <select
            className='col-lg-11 form-control mx-3 mx-lg-0'
            id='client'
            name='client'
            value={corrStore.request.client_name}
            onChange={this.onChange}
          >
            <option key={0} data-key={0} value='0'>
              ------------
            </option>
            {corrStore.clients.map((client) => {
              if (parseInt(corrStore.request.product_id) === client.product_type_id) {
                return (
                  <option key={client.id} data-key={client.id} value={client.name}>
                    {client.name}
                  </option>
                );
              }
            })}
          </select>
        </div>
        <small>Оберіть продукт, щоб сформувати список відповідних клієнтів</small></>
    );
  }
}

export default view(Client);
