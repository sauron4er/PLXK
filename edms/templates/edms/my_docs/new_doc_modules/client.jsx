'use strict';
import * as React from 'react';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import {LoaderSmall} from 'templates/components/loaders';
import corrStore from '../../../../../correspondence/templates/correspondence/store';

class Client extends React.Component {
  state = {
    clients: [],
    loading: true
  };

  componentDidMount() {
    axiosGetRequest('get_clients/3/')
      .then((response) => {
        this.setState({
          clients: response,
          loading: false
        });
      })
      .catch((error) => console.log(error));
  }

  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    newDocStore.new_document.client = event.target.options[selectedIndex].getAttribute('data-key');
    newDocStore.new_document.client_name = event.target.options[selectedIndex].getAttribute('value');
  };

  render() {
    const {module_info} = this.props;
    const {loading, clients} = this.state;
  
    return (
      <Choose>
        <When condition={!loading}>
          <div className='row align-items-center mr-lg-1'>
            <label className='col-lg-4' htmlFor='client'>
              <If condition={module_info.required}>{'* '}</If>{module_info.field_name}:
            </label>
            <select
              className='col-lg-8 form-control mx-3 mx-lg-0'
              id='client'
              name='client'
              value={newDocStore.new_document.client_name}
              onChange={this.onChange}
            >
              <option key={0} data-key={0} value='0'>
                ------------
              </option>
              {clients.map((client) => {
                return (
                  <option key={client.id} data-key={client.id} value={client.name}>
                    {client.name} ({client.country})
                  </option>
                );
              })}
            </select>
          </div>
          <small className='text-danger'>{module_info?.additional_info}</small>
        </When>
        <Otherwise>
          <LoaderSmall />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    client: [],
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    },
  };
}

export default view(Client);
