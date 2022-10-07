'use strict';
import * as React from 'react';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import {LoaderSmall} from 'templates/components/loaders';
import SelectorWithFilter from "templates/components/form_modules/selectors/selector_with_filter";

class Client extends React.Component {
  state = {
    clients: [],
    loading: true
  };

  componentDidMount() {
    const product_type = this.props.docType === 6 ? 3 : 0; // 6 - Дизайн-макети, в них викор. лише клієнти, які купують ДВП (product_type=3)

    axiosGetRequest(`get_clients/${product_type}/`)
      .then((response) => {
        this.setState({
          clients: response,
          loading: false
        });
      })
      .catch((error) => console.log(error));
  }

  onChange = (event) => {
    // const selectedIndex = event.target.options.selectedIndex;
    newDocStore.new_document.client = event.id;
    // newDocStore.new_document.client = event.target.options[selectedIndex].getAttribute('data-key');
    // newDocStore.new_document.client_name = event.target.options[selectedIndex].getAttribute('value');
    newDocStore.new_document.client_name = event.name;
  };

  render() {
    const {module_info} = this.props;
    const {loading, clients} = this.state;

    return (
      <Choose>
        <When condition={!loading}>
          <div>
          {/*<div className='row align-items-center mr-lg-1'>*/}
            {/*<label className='col-lg-4' htmlFor='client'>*/}
            {/*  <If condition={module_info.required}>{'* '}</If>*/}
            {/*  {module_info.field_name}:*/}
            {/*</label>*/}
            <SelectorWithFilter
              list={clients}
              fieldName={module_info.field_name}
              value={{name: newDocStore.new_document.client_name, id: newDocStore.new_document.client}}
              onChange={this.onChange}
              disabled={false}
            />
            
            {/*<select*/}
            {/*  className='col-lg-8 form-control mx-3 mx-lg-0'*/}
            {/*  id='client'*/}
            {/*  name='client'*/}
            {/*  value={newDocStore.new_document.client_name}*/}
            {/*  onChange={this.onChange}*/}
            {/*>*/}
            {/*  <option key={0} data-key={0} value='0'>*/}
            {/*    ------------*/}
            {/*  </option>*/}
            {/*  {clients.map((client) => {*/}
            {/*    return (*/}
            {/*      <option key={client.id} data-key={client.id} value={client.name}>*/}
            {/*        {client.name} ({client.country})*/}
            {/*      </option>*/}
            {/*    );*/}
            {/*  })}*/}
            {/*</select>*/}
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
    docType: 0,
    module_info: {
      field_name: '---',
      queue: 0,
      required: false,
      additional_info: null
    }
  };
}

export default view(Client);
